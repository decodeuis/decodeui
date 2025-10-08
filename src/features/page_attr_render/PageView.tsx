import { createMemo, Match, Show, Switch, JSX, getOwner, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useSearchParams, useLocation, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/styled/modal/Toast";
import { useZIndex } from "~/components/fields/ZIndex";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  usePreviewContext,
  type PreviewStoreObject,
} from "~/features/page_designer/context/PreviewContext";
import {
  DataContext,
} from "~/features/page_attr_render/context/DataContext";
import {
  PageRenderContextProvider,
  type PageRenderObject,
} from "./context/PageRenderContext";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { evalExpression } from "~/lib/expression_eval";
import { ComponentWrapper } from "./ComponentWrapper";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { createFunctionArgumentWithValue } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentWithValue";
import { createFunctionArgumentBase } from "~/components/form/dynamic_component/functions/function_argument/createFunctionArgumentBase";
import { createDynamicFunctions } from "~/components/form/dynamic_component/functions/function_argument/createDynamicFunctions";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { HtmlField } from "~/components/fields/HtmlField";
import {DataInternal} from "~/components/fields/data/DataInternal";

export function PageView(
  props: Readonly<{
    context?: Record<string, unknown>;
    data?: Vertex;
    hasFullPermission?: boolean | null;
    hasEditPermission?: boolean | null;
    hasCreatePermission?: boolean | null;
    hasViewPermission?: boolean | null;
    id?: Id;
    isDesignMode?: boolean;
    isNoPermissionCheck?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const [previewStore2] = usePreviewContext();
  
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
  const contextData = useDataContext() || {};
  const [ref, setRef] = createSignal<HTMLElement | null>(null);
  const [mounted, setMounted] = createSignal<null | boolean>(null);
  const [componentName] = createSignal<string>("Html");

  const parentRenderContext = () =>
    getLastItem(parentItems)?.[0] as
      | { context: FunctionArgumentType }
      | undefined;
  const parentMeta = () => parentRenderContext()?.context.meta;

  // Create dynamic functions for the component
  const dynamicFns = createDynamicFunctions(
    graph,
    () => props.metaVertex,
    () => getFunctionArgumentWithValue(),
    parentRenderContext,
    componentName,
  );

  // Create function proxy
  const functionProxy = createFunctionProxy(
    () => dynamicFns,
    parentRenderContext,
  );

  const isViewOnlyForm = createMemo(() => {
    if (!(props.id || props.hasCreatePermission)) {
      return true;
    }
    if (props.id && !props.hasEditPermission) {
      return props.hasViewPermission;
    }
  });

  // Create a proper function argument for evaluating dynamic props
  const getFunctionArgument = () => {
    const meta = props.metaVertex;
    if (!meta) return {} as FunctionArgumentType;

    return createFunctionArgumentBase(
      {
        data: props.data,
        meta,
      },
      {
        formVertex: () => ({}) as any,
        formId: "page-view",
        componentName,
        isNoPermissionCheck: () => props.isNoPermissionCheck || false,
        isViewMode: () => false,
        mounted,
        parentMeta,
        ref,
        setRef,
        updateValue: () => {},
        onChange: () => {},
        hasFullPermission: () => props.hasFullPermission || true,
        hasEditPermission: () => props.hasEditPermission || true,
        hasCreatePermission: () => props.hasCreatePermission || true,
        hasViewPermission: () => props.hasViewPermission || true,
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
        previewStore: previewStore2,
        themeToggle,
        owner: owner!,
        parentRenderContext,
        functionProxy,
      },
    );
  };

  const getFunctionArgumentWithValue = () =>
    createFunctionArgumentWithValue(getFunctionArgument, () => undefined);

  // Evaluate dynamic props from metaVertex
  const dynamicProps = createDynamicPropsMemo(
    { get meta() { return props.metaVertex } },
    {
      graph,
      getFunctionArgumentWithValue,
    },
  );

  // Lifecycle setup using useComponentLifecycle hook
    useComponentLifecycle({
      dynamicProps,
      getFunctionArgumentWithValue,
      setMounted,
      reMount: true
    });

  onCleanup(() => {
    setRef(null);
    setMounted(false);
  });

  // Function to find and log layout vertexes
  const logLayoutVertexes = () => {
    if (props.metaVertex) {
      // First get all Layout vertices from the data vertex
      const layoutVertices = evalExpression("->$0Layout", {
        graph,
        setGraph,
        vertexes: [props.metaVertex],
      }) || [];
      
      // Sort by displayOrder
      const sortedLayouts = layoutVertices.sort((a: Vertex, b: Vertex) => 
        (a.P.displayOrder || 0) - (b.P.displayOrder || 0)
      );

      // Collect all component vertices
      const allComponents: Vertex[] = [];
      
      // For each sorted layout, find its Component
      for (const layoutVertex of sortedLayouts) {
        const componentName = layoutVertex.P.componentName;
        const components = componentName 
          ? [findVertexByLabelAndUniqueId(graph, "Component", "key", componentName)].filter(Boolean) as Vertex[]
          : [];
        
        // Add components to the array
        allComponents.push(...components);
      }
      
      return allComponents;
    }
    
    return [];
  };

  // Calculate layout components for Page vertices
  const layouts = createMemo(() => {
    if (props.metaVertex?.L[0] === "Page") {
      return logLayoutVertexes();
    }
    return [];
  });

  const previewStore = createStore<PreviewStoreObject>({
    get context() {
      return props.context;
    },
    get hasFullPermission() {
      return props.hasFullPermission;
    },
    get hasEditPermission() {
      return props.hasEditPermission;
    },
    get hasCreatePermission() {
      return props.hasCreatePermission;
    },
    get hasViewPermission() {
      return props.hasViewPermission;
    },
    get id() {
      return props.id;
    },
    get isDesignMode() {
      return props.isDesignMode;
    },
    get isNoPermissionCheck() {
      return props.isNoPermissionCheck;
    },
    get isViewOnly() {
      return isViewOnlyForm();
    },
    get previewData() {
      return props.data;
    },
    get previewMeta() {
      return props.metaVertex;
    },
  });

  const repeterStore = createStore({
    get context() {
      return {
        get fns() {
          return functionProxy;
        },
      };
    },
  } as PageRenderObject);

  // Inner component to handle recursive layout rendering
  const LayoutRenderer = (innerProps: { index: number; content: JSX.Element }) => {
    const currentLayout = createMemo(() => 
      innerProps.index < layouts().length ? layouts()[innerProps.index] : null
    );
    
    const LayoutContent = () => {
      const SlotChildren = (childProps: { slot?: string }) => {
        return (
          <Show
            when={!childProps.slot || childProps.slot === 'children'}
            fallback={null}
          >
            <LayoutRenderer 
              index={innerProps.index + 1} 
              content={innerProps.content} 
            />
          </Show>
        );
      };
      
      return (
        <SlotContext.Provider value={[SlotChildren]}>
          {/*<Show*/}
          {/*  when={currentLayout()?.L[0] === "Component"}*/}
          {/*  fallback={*/}
          {/*    <DataContext.Provider value={{ index: 0 }}>*/}
          {/*      <PageAttrRender*/}
          {/*        data={props.data}*/}
          {/*        isNoPermissionCheck={props.isNoPermissionCheck}*/}
          {/*        metaVertex={currentLayout()!}*/}
          {/*      />*/}
          {/*    </DataContext.Provider>*/}
          {/*  }*/}
          {/*>*/}
            <ComponentWrapper 
              metaVertex={currentLayout()!}
              data={props.data}
              isNoPermissionCheck={props.isNoPermissionCheck}
            />
          {/*</Show>*/}
        </SlotContext.Provider>
      );
    };
    
    return (
      <Show
        when={currentLayout()}
        fallback={innerProps.content}
      >
        <LayoutContent />
      </Show>
    );
  };

  const MainContent = () => (
    <Switch>
      <Match when={props.metaVertex?.L[0] === "Component"}>
        <ComponentWrapper 
          metaVertex={props.metaVertex!}
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck}
        />
      </Match>
      <Match when={dynamicProps().data || dynamicProps().expression || dynamicProps().serverFunction}>
        <PageAttrRender
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck!}
          metaVertex={props.metaVertex!}
        />
      </Match>
      <Match when={true}>
        <DataInternal
          data={props.data}
          index={0}
          meta={props.metaVertex!}
          contextName={""}
          repeaterValue={{ index: 0 }}
          isNoPermissionCheck={props.isNoPermissionCheck!}
        />
      </Match>
    </Switch>
  );

  const MainContentDataWrapper = () => (
    <Switch>
      <Match when={dynamicProps().data || dynamicProps().expression || dynamicProps().serverFunction}>
        <HtmlField
          data={dynamicProps().data}
          expression={dynamicProps().expression}
          serverFunction={dynamicProps().serverFunction}
          loop={dynamicProps().loop}
          contextName={dynamicProps().contextName}
          renderChildren
        >
          <MainContent />
        </HtmlField>
      </Match>
      <Match when={true}>
        <MainContent />
      </Match>
    </Switch>
  );

  return (
    <Show when={props.metaVertex}>
      <PreviewContext.Provider value={previewStore}>
        <PageRenderContextProvider store={repeterStore}>
          <Show
            when={layouts().length > 0}
            fallback={<MainContentDataWrapper/>}
          >
            <LayoutRenderer index={0} content={<MainContentDataWrapper/>} />
          </Show>
        </PageRenderContextProvider>
      </PreviewContext.Provider>
    </Show>
  );
}
