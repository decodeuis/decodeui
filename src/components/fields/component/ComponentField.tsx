import { createMemo, Show, splitProps, useContext, Switch, Match } from "solid-js";
import { createAsync } from "@solidjs/router";

import { SlotContext, SlotContextType } from "~/components/fields/component/contexts/SlotContext";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  usePreviewContext,
} from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import { getComponentDefaultValues } from "./functions/getComponentDefaultValues";
import {
  DataContext,
  useDataContext,
} from "~/features/page_attr_render/context/DataContext";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";
import type { JSX } from "solid-js";

export function ComponentField(props: Readonly<{ children?: JSX.Element }>) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [previewStore, setPreviewStore] = usePreviewContext();
  const [, otherProps] = splitProps(props, ["children"]);

  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data as Vertex | undefined;
  const componentName = () => parentRenderContext()!.context.componentName;

  const getCompVertex = createMemo(() =>
    meta()
      ? findVertexByLabelAndUniqueId(graph, "Component", "key", componentName())
      : undefined,
  );

  const componentData = createAsync(
    async () => {
      const name = componentName();
      if (typeof name !== "string") {
        return {};
      }
      // when there is no children (when creating a component and added in tree) it continues to fetch, improve it
      if (meta()?.id?.startsWith("-")) {
        return {};
      }
      const vertex = getCompVertex();
      if (vertex && getChildrenAttrs(graph, setGraph, vertex).length !== 0) {
        return {};
      }
      return await fetchComponentData([name]);
    },
    { deferStream: true },
  );

  // createEffect(
  //   on(getCompVertex, (component, prevComponent) => {
  //     if (
  //       component &&
  //       JSON.parse(JSON.stringify(component)) !==
  //       JSON.parse(JSON.stringify(prevComponent || [])) &&
  //       (component.length === 0 ||
  //         getChildrenAttrs(graph, setGraph, component[0]).length === 0)
  //     ) {
  //       // Fetch attrs when no children found
  //       // Trigger refetch by accessing the async resource
  //       componentData();
  //     }
  //   }),
  // );

  const previewStoreProxy = new Proxy(previewStore, {
    get(target, prop) {
      if (prop === "isDesignMode") {
        // @ts-expect-error ignore temporary key name
        return target.isDesignModePrev;
      }
      return target[prop as keyof typeof target];
    },
  });

  const ComponentWrapper = () => {
    const contextData = useDataContext() || {};

    const propsMemo = createMemo(() => {
      const defaultValues = getComponentDefaultValues(
        getCompVertex()!,
        graph,
        setGraph,
      );
      return { ...defaultValues, ...removeUndefinedProperties(otherProps) };
    });

    const valuesProxy = new Proxy(
      {},
      {
        get(_, key) {
          if (
            key === Symbol.toPrimitive ||
            key === "toString" ||
            key === "valueOf"
          ) {
            return () => JSON.stringify(propsMemo());
          }
          if (key === "context") {
            return parentRenderContext()?.context;
          }
          const propValue = props[key as keyof typeof props];
          if (propValue !== undefined && propValue !== null) {
            return propValue;
          }
          const defaultValues = getComponentDefaultValues(
            getCompVertex()!,
            graph,
            setGraph,
          );
          return defaultValues[key as keyof typeof defaultValues];
        },
        ownKeys() {
          return Reflect.ownKeys(propsMemo());
        },
        getOwnPropertyDescriptor(_, prop) {
          const value = propsMemo()[prop as keyof ReturnType<typeof propsMemo>];
          return value !== undefined
            ? {
                enumerable: true,
                configurable: true,
                value,
              }
            : undefined;
        },
      },
    );

    const newDataContext = new Proxy(contextData, {
      get(target, key) {
        if (key === "props") {
          return valuesProxy;
        }
        return target[key];
      },
    });

    return (
      <DataContext.Provider value={newDataContext}>
        <PageAttrRender
          data={data()}
          metaVertex={getCompVertex() as Vertex}
          isNoPermissionCheck={
            parentRenderContext()?.context.isNoPermissionCheck
          }
        />
      </DataContext.Provider>
    );
  };

  const Children = (props: { slot: string, class?: string }) => {
    const currentSlotComponents = useContext(SlotContext) || [];

    const slotFilter = (vertex: Vertex) => {
      if (props.slot) {
        return vertex.P.slot === props.slot;
      }
      return !vertex.P.slot;
    };

    // Check if slot name includes level indicator (e.g., "1footer")
    const hierarchicalMatch = () => props.slot?.match(/^(\d+)(.+)$/);

    return (
      <Switch>
        <Match when={hierarchicalMatch()}>
          {(match) => {
            const [, levelStr, slotName] = match();
            const level = parseInt(levelStr, 10);

            // Use the parent slot component at the specified level
            const SlotComponentParent = level > 0 && level <= currentSlotComponents.length
              ? currentSlotComponents[currentSlotComponents.length - level - 1]
              : null as unknown as SlotContextType;

            return (
              <Show when={SlotComponentParent}>
                <SlotComponentParent slot={slotName} />
              </Show>
            );
          }}
        </Match>
        <Match when={true}>
          <PreviewContext.Provider value={[previewStoreProxy, setPreviewStore]}>
            <Show when={meta()}>
              <PageAttrRender
                data={data()}
                isNoPermissionCheck={
                  parentRenderContext()?.context.isNoPermissionCheck
                }
                metaVertex={meta() as Vertex}
                filter={slotFilter}
                class={props.class}
              />
            </Show>
          </PreviewContext.Provider>
        </Match>
      </Switch>
    );
  };

  const Content = () => {
    // Get parent children components from SlotContext
    const parentSlotComponents = useContext(SlotContext) || [];

    if (componentData()?.graph) {
      setGraphData(graph, setGraph, componentData()!.graph!, {
        skipExisting: true,
      });
    }
    return (
      <Show
        when={getCompVertex() && typeof componentName() === "string"}
        fallback={
          <div>
            {typeof componentName() !== "string"
              ? "Component name should be a string"
              : `No Component Found: ${componentName()}`}
          </div>
        }
      >
        <SlotContext.Provider value={[...parentSlotComponents, Children]}>
          <ComponentWrapper />
        </SlotContext.Provider>
      </Show>
    );
  };

  return (
    <Show when={componentData()}>
      <Content />
    </Show>
  );
}
