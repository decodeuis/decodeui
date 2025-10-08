// ADD a Feature:
// When nested PageViewWrapper is used, children should get parent context too.
import { batch, createMemo, createEffect, on, Match, Show, Switch, untrack } from "solid-js";

import { FormContext } from "~/components/form/context/FormContext";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { SimpleAlert } from "~/components/styled/SimpleAlert";
import { PageView } from "~/features/page_attr_render/PageView";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { NotFound } from "~/components/404";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { createFunctionArgumentBase } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentBase";
import { createFunctionArgumentWithValue } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentWithValue";
import { useToast } from "~/components/styled/modal/Toast";
import { useSearchParams, useLocation, useNavigate } from "@solidjs/router";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { useZIndex } from "~/components/fields/ZIndex";
import { getOwner, createSignal } from "solid-js";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

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
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import {SaveCancelButton} from "~/components/form/SaveCancelButton";
import {isDisabledTxn} from "~/lib/graph/transaction/value/isDisabledTxn";

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

  // Context hooks needed for function arguments
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const zIndex = useZIndex();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const themeToggle = useThemeToggle();
  const owner = getOwner();
  const parentItems = usePageRenderContext();
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const [mounted, setMounted] = createSignal<null | boolean>(null);
  const [componentName] = createSignal<string>("Html");

  const parentRenderContext = () =>
    getLastItem(parentItems)?.[0] as
      | { context: FunctionArgumentType }
      | undefined;
  const parentMeta = () => parentRenderContext()?.context.meta;

  // Create a proper function argument for evaluating dynamic props
  const getFunctionArgument = () => {
    const meta = metaVertex();
    if (!meta) return {} as FunctionArgumentType;

    return createFunctionArgumentBase(
      {
        data: dataVertex(),
        meta,
      },
      {
        formVertex: () => formStore() as any,
        formId: formStore().id,
        componentName,
        isNoPermissionCheck: () => props.isNoPermissionCheck || false,
        isViewMode: () => false,
        mounted,
        parentMeta,
        ref,
        setRef,
        updateValue: () => {},
        onChange: () => {},
        hasFullPermission: () => true,
        hasEditPermission: () => true,
        hasCreatePermission: () => true,
        hasViewPermission: () => true,
      },
      {
        graph,
        setGraph,
        toast,
        searchParams,
        setSearchParams,
        zIndex,
        navigate,
        location,
        theme,
        parentItems,
        previewStore,
        themeToggle,
        owner: owner!,
        parentRenderContext,
        functionProxy: {},
      },
    );
  };

  const getFunctionArgumentWithValue = () =>
    createFunctionArgumentWithValue(getFunctionArgument, ()=> undefined);

  // Evaluate dynamic props from metaVertex
  const dynamicProps = (() => { // cant use createMemo, as it is giving error: tempate is not defined during ssr. must fix letter
    const meta = metaVertex();
    if (!meta) return {};

    return createDynamicPropsMemo(
      { meta },
      {
        graph,
        getFunctionArgumentWithValue,
      },
    )();
  });

  const isNoPermissionCheck = () =>
    props.isNoPermissionCheck ||
    dynamicProps().isNoPermissionCheck ||
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

  const constants = (): PageViewConstants => ({
    get dataId() { return props.dataId; },
    get expression() { return props.expression; },
    get formDataId() { return props.formDataId; },
    get formId() { return props.formId; },
    get formMetaId() { return untrack(()=>props.formMetaId) },
    get getFormData() { return !!props.getFormData; },
    get isDesignMode() { return props.isDesignMode; },
    get isNoPermissionCheck() { return props.isNoPermissionCheck; },
    get pageKeyName() { return props.pageKeyName; },
    get pageVertexName() { return props.pageVertexName; },
    get url() { return props.url; },
  });

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
      ["Page"].includes(metaVertex()?.L[0])
    ) {
      const dynamicFns = getDynamicFns();
      const enabled = typeof dynamicFns.enabled === 'function'
        ? dynamicFns.enabled()
        : dynamicFns.enabled;

      if (!enabled) {
        const errorMsg = `${props.pageVertexName} is not enabled. Please contact your administrator.`;
        setFormStore("error", errorMsg);
        return errorMsg;
      }
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
      batch(() => {
        setFormStore("error", "");
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
    createEffect(
      on(
        metaData,
        () => {
          const result = metaData();
          if (result) {
            processResult(result);
          }
        },
        { defer: true }
      )
    );
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
                <Show when={isNoPermissionCheck() && !(props.hideSaveCancelButton ?? true)}>
                <SaveCancelButton
                  closePopUp={props.closePopUp}
                  disabled={isDisabledTxn(formStore().P.txnId, graph)}
                />
              </Show>
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

