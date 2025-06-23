// ADD a Feature:
// When nested PageViewWrapper is used, children should get parent context too.
import { batch, createMemo, Match, Show, Switch, untrack } from "solid-js";

import { FormContext } from "~/components/form/context/FormContext";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { SimpleAlert } from "~/components/styled/SimpleAlert";
import { PageView } from "~/features/page_attr_render/PageView";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { NotFound } from "~/components/404";

import type {
  PageViewWrapperProps,
  PageViewConstants,
} from "./PageViewWrapper/types";
import { useVertexManagement } from "./PageViewWrapper/useVertexManagement";
import { usePermissions } from "./PageViewWrapper/usePermissions";
import { useMetadata } from "./PageViewWrapper/useMetadata";
import { useFormData } from "./PageViewWrapper/useFormData";
import { useLifecycle } from "./PageViewWrapper/useLifecycle";
import type {
  FetchFormDataResult,
  FetchFormMetaDataResult,
} from "~/pages/functions/fetchPageData";

export function PageViewWrapper(props: Readonly<PageViewWrapperProps>) {
  const [graph, setGraph] = useGraph();
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );

  // Initialize vertex management
  const { formStore, setFormStore, createErrorVertex } = useVertexManagement(
    props,
    {
      graph,
      setGraph,
      id,
    },
  );

  const metaTxnId = props.metaTxnId ?? generateNewTxnId(graph, setGraph);
  const metaVertex = () => graph.vertexes[formStore().P.formMetaId!];
  const dataVertex = () => graph.vertexes[formStore().P.formDataId!];

  const [previewStore] = usePreviewContext();

  const isNoPermissionCheck = () =>
    props.isNoPermissionCheck ||
    metaVertex()?.P.isNoPermissionCheck ||
    previewStore.isNoPermissionCheck;

  // Initialize permissions
  const { permissions, checkAuthError, getDynamicFns } = usePermissions(props, {
    graph,
    metaVertex,
    isNoPermissionCheck,
    id,
    previewStore,
  });

  const constants: PageViewConstants = {
    dataId: props.dataId,
    expression: props.expression,
    formDataId: props.formDataId,
    formId: props.formId,
    formMetaId: props.formMetaId,
    getFormData: !!props.getFormData,
    isDesignMode: props.isDesignMode,
    isNoPermissionCheck: props.isNoPermissionCheck,
    pageKeyName: props.pageKeyName,
    pageVertexName: props.pageVertexName,
    url: props.url,
  };

  // Initialize metadata handling
  const { metaData, setFormMetaData } = useMetadata(props, {
    graph,
    setGraph,
    constants,
    setFormStore,
    metaTxnId,
    previewStore,
  });

  // Initialize form data handling
  const { handleFormData } = useFormData(props, {
    graph,
    setGraph,
    id,
    setFormStore,
    formStore,
    metaVertex,
    createErrorVertex,
  });

  // Initialize lifecycle hooks
  const { onConfirmExit } = useLifecycle(props, {
    graph,
    setGraph,
    formStore,
    setFormStore,
    metaTxnId,
  });

  function validateMetaVertex(): string {
    if (
      formStore().P.formMetaId &&
      !isNoPermissionCheck() &&
      ["Page"].includes(metaVertex()?.L[0]) &&
      !getDynamicFns().enabled?.()
    ) {
      const errorMsg = `${props.pageVertexName} is not enabled. Please contact your administrator.`;
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    if (!metaVertex()) {
      const errorMsg = "No Page found";
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    if (!metaVertex()?.P.key) {
      const errorMsg = `No key for the ${props.pageVertexName}`;
      setFormStore("error", errorMsg);
      return errorMsg;
    }

    const authError = checkAuthError();
    if (authError) {
      setFormStore("error", authError);
      return authError;
    }

    return "";
  }

  props.initializeFormStoreParent?.(formStore().id);

  const processResult = (result?: {
    formMetaId?: string;
    metaResult?: FetchFormMetaDataResult;
    dataResult?: FetchFormDataResult;
    error?: string;
  }) => {
    if (result) {
      untrack(() => {
        batch(() => {
          if (result.error) {
            setFormStore("error", result.error);
          } else {
            setFormMetaData(result?.metaResult, result?.formMetaId);
            const validationError = validateMetaVertex();
            if (!validationError) {
              handleFormData(result?.dataResult);
            }
          }
        });
      });
    }
  };

  const Content = () => (
    <PageView
      context={props.context}
      data={dataVertex()}
      hasFullPermission={permissions.full()}
      hasEditPermission={permissions.edit()}
      hasCreatePermission={permissions.create()}
      hasViewPermission={permissions.view()}
      id={id()}
      isNoPermissionCheck={isNoPermissionCheck()}
      metaVertex={metaVertex()!}
    />
  );

  const ContentSSR = () => {
    processResult(metaData());

    return (
      <>
        <Show when={formStore().P.error === "404"}>
          <NotFound error={""} />
        </Show>
        <Show when={formStore().P.error !== "404" && formStore().P.error}>
          <SimpleAlert type="error" message={formStore().P.error} />
        </Show>
        {/* <Show when={getGlobalStore(graph).P.isDevelopment}>
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={authError()}
          hasFullPermission={permissions.full() ?? false}
          hasEditPermission={permissions.edit() ?? false}
          hasCreatePermission={permissions.create() ?? false}
          hasViewPermission={permissions.view() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={formStore().P.formMeta?.id}
          mounted={formStore().P.mounted}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
        <Show
          fallback={<div>Data not found!</div>}
          when={
            metaData() &&
            (props.getFormData
              ? dataVertex() || !formStore().P.isFetching
              : true)
          }
        >
          <FormContext.Provider value={formStore().id}>
            <Switch>
              <Match
                when={
                  !formStore().P.error &&
                  metaVertex() &&
                  (props.dataId && props.dataId !== "new"
                    ? dataVertex() || formStore().P.isFetching
                    : true)
                }
              >
                <Content />
                {/* <Show when={isNoPermissionCheck() && !props.hideSaveCancelButton}>
                <SaveCancelButton
                  closePopUp={props.closePopUp}
                  disabled={isDisabledTxn(formStore().P.txnId, graph)}
                />
              </Show> */}
              </Match>
            </Switch>
          </FormContext.Provider>
        </Show>
        <Show when={formStore().P.discardPopup}>
          <DialogWithButtons
            message="Discard unsaved changes - are you sure?"
            onCancel={() => setFormStore("discardPopup", false)}
            onConfirm={() => {
              revertTransaction(formStore().P.txnId, graph, setGraph);
              setFormStore("discardPopup", false);
              onConfirmExit();
            }}
            open={() => formStore().P.discardPopup}
            setOpen={setFormStore.bind(null, "discardPopup")}
            title="Discard changes"
          />
        </Show>
      </>
    );
  };

  return (
    <Show
      when={
        metaData() &&
        formStore().P.count &&
        (props.getFormData ? dataVertex() || !formStore().P.isFetching : true)
      }
    >
      <ContentSSR />
    </Show>
  );
}
