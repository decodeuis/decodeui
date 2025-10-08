import {
  createSignal,
  type JSX,
  Match,
  onCleanup,
  onMount,
  Show,
  Suspense,
  Switch,
  getOwner,
  ErrorBoundary,
  createMemo,
  untrack,
} from "solid-js";
import { useSearchParams, useLocation, useNavigate } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import {
  PageRenderContextProvider,
  usePageRenderContext,
} from "~/features/page_attr_render/context/PageRenderContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { useZIndex } from "../fields/ZIndex";
import { useToast } from "../styled/modal/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";

import { ContentWrapper } from "~/components/form/dynamic_component/components/DynamicContent";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";

import { useComponentPermissions } from "~/components/form/dynamic_component/hooks/useComponentPermissions";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { useComponentName } from "~/components/form/dynamic_component/hooks/useComponentName";

import type { Vertex } from "~/lib/graph/type/vertex";
import { createComponentMemo } from "~/components/form/dynamic_component/functions/component/createComponentMemo";
import { isComponentHidden } from "~/components/form/dynamic_component/functions/component/isComponentHidden";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { createCssStyleMemo } from "~/components/form/dynamic_component/functions/createCssStyleMemo";
import { createProcessedTextMemo } from "~/components/form/dynamic_component/functions/createProcessedTextMemo";
import { createMergedClasses } from "~/components/form/dynamic_component/functions/createMergedClasses";
import { createFunctionArgumentBase } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentBase";
import { createFunctionArgumentWithValue } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentWithValue";
import { createDynamicFunctions } from "~/components/form/dynamic_component/functions/function_argument/createDynamicFunctions";
import { createValueUpdater } from "~/components/form/dynamic_component/functions/value/createValueUpdater";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createStore } from "solid-js/store";
import { Style } from "@solidjs/meta";

export type DynamicComponentProps = Readonly<{
  componentName?: string;
  data?: Vertex;
  disabled?: boolean;
  isLabelWrap?: boolean;
  isNoPermissionCheck?: boolean | null;
  isRealTime?: boolean;
  isTableInside?: boolean;
  isViewMode?: boolean;
  meta: Vertex;
  noLabel?: boolean;
  onChange?: (data: unknown) => void;
  title?: string;
  txnId?: number;
  children?: JSX.Element;
  class?: string;
}>;

/**
 * DynamicComponent is a flexible component that can render different components
 * based on configuration and permissions.
 */
export function DynamicComponent(props: DynamicComponentProps) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const [mounted, setMounted] = createSignal<null | boolean>(null);
  const [componentName, setComponentName] = createSignal<string>("Html");

  // Context hooks
  const parentItems = usePageRenderContext();
  const parentRenderContext = () =>
    getLastItem(parentItems)?.[0] as
      | { context: FunctionArgumentType }
      | undefined;
  const parentMeta = () => parentRenderContext()?.context.meta;
  const [previewStore] = usePreviewContext();

  // Additional hooks
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const zIndex = useZIndex();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const themeToggle = useThemeToggle();
  const owner = getOwner();

  // Permission hooks
  const {
    hasCreatePermission,
    hasEditPermission,
    hasViewPermission,
    hasFullPermission,
    isNoPermissionCheck,
    hasPermission,
    isDisabledByPermissions,
    permissions,
  } = useComponentPermissions(props);

  // Component view mode and read-only state
  const isViewMode = () =>
    props.isViewMode ??
    props.meta.P.isViewMode ??
    parentRenderContext()?.context?.isViewMode;

  // Create the value management utilities
  const { value, updateValue, onChange } = createValueUpdater(props, {
    formVertex,
    isNoPermissionCheck,
    hasCreatePermission,
    hasEditPermission,
  });

  // Create dynamic functions for the component
  const dynamicFns = createDynamicFunctions(
    graph,
    () => props.meta,
    () => getFunctionArgumentWithValue(),
    parentRenderContext,
    componentName,
  );

  // Create function proxy
  const functionProxy = createFunctionProxy(
    () => dynamicFns,
    parentRenderContext,
  );

  // Create function arguments
  const getFunctionArgument = () =>
    createFunctionArgumentBase(
      props,
      {
        formVertex,
        formId,
        componentName: () => componentName(),
        isNoPermissionCheck,
        isViewMode: () => isViewMode(),
        mounted,
        parentMeta,
        ref,
        setRef,
        updateValue,
        onChange,
        hasFullPermission,
        hasEditPermission,
        hasCreatePermission,
        hasViewPermission,
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
        functionProxy,
      },
    );

  const getFunctionArgumentWithValue = createMemo(() =>
    createFunctionArgumentWithValue(getFunctionArgument, value)
  );

  const dynamicProps = createDynamicPropsMemo(props, {
    graph,
    getFunctionArgumentWithValue,
  });

  useComponentName({
    props,
    componentName,
    setComponentName,
    graph,
    dynamicProps,
    meta: props.meta,
  });

  const component = createComponentMemo(componentName);

  const isHidden = () =>
    isComponentHidden(props, {
      dynamicProps,
      getFunctionArgumentWithValue,
    });

  const { cssStyle, styleId } = createCssStyleMemo(props, {
    getFunctionArgumentWithValue,
  });

  const mergedClasses = createMergedClasses(props, {
    dynamicProps,
    styleId,
    cssStyle,
  });

  const processedText = createProcessedTextMemo(props, {
    dynamicProps,
    getFunctionArgumentWithValue,
  });



  const repeaterStore = createStore({
    get context() {
      return getFunctionArgumentWithValue();
    },
  });
  const ContentWrapperWithMount = () => {
    useComponentLifecycle({
      dynamicProps,
      getFunctionArgumentWithValue,
      setMounted,
    });

  onCleanup(() => {
    setRef(null);
    setMounted(false);
  });

    return  <ContentWrapper
          meta={props.meta}
          data={props.data}
          children={props.children}
          dynamicProps={dynamicProps}
          mergedClasses={mergedClasses}
          permissions={permissions}
          component={component}
          processedText={processedText}
          // disabled={
          //   isNoPermissionCheck()
          //     ? props.meta.P.disabled
          //     : (props.disabled ??
          //       previewStore?.isViewOnly ??
          //       isDisabledByPermissions() ??
          //       props.meta.P.disabled)
          // }
          ref={ref}
          setRef={setRef}
          isNoPermissionCheck={isNoPermissionCheck}
        />
  }

  // Create the main content component that will be wrapped conditionally
  const ContentInner = () => (
    <Switch>
      <Match when={isHidden()}></Match>
      <Match when={!component()}>NO INPUT {componentName() as string}</Match>

      <Match
        when={component() && (isNoPermissionCheck() || hasPermission())}
      >
       <ContentWrapperWithMount/>
      </Match>
      <Match when={getGlobalStore(graph).P.isDevelopment}>
        Hidden component
      </Match>
    </Switch>
  );

  return (
    <ErrorBoundary fallback={(err) => <div>Error: {err.message}</div>}>
      <Suspense>
        <Show when={cssStyle()}>
          <Style>{cssStyle()}</Style>
        </Show>
        {/* <Show when={!props.isNoPermissionCheck && getGlobalStore(graph).P.isDevelopment}>
        comp:{componentName()}
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={""}
          hasFullPermission={hasFullPermission() ?? false}
          hasEditPermission={hasEditPermission() ?? false}
          hasCreatePermission={hasCreatePermission() ?? false}
          hasViewPermission={hasViewPermission() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={props.meta.id}
          mounted={true}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
        <PageRenderContextProvider store={repeaterStore}>
          <Switch>
            <Match when={!previewStore.isDesignMode}>
              <ContentInner />
            </Match>
            <Match when={previewStore.isDesignMode}>
              {(() => {
                const PageAttrDnDWrapper = clientOnly(
                  () =>
                    import(
                      "~/features/page_attr_render/page_attr_dnd_wrapper/components/PageAttrDnDWrapper"
                    ),
                );
                return (
                  <PageAttrDnDWrapper item={props.meta}>
                    <ContentInner />
                  </PageAttrDnDWrapper>
                );
              })()}
            </Match>
          </Switch>
        </PageRenderContextProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
