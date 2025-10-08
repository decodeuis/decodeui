import { createMemo } from "solid-js";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { useDataContext, DataContext } from "~/features/page_attr_render/context/DataContext";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { getComponentDefaultValues } from "~/components/fields/component/functions/getComponentDefaultValues";
import { deNullify } from "~/lib/data_structure/object/deNullify";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";

export interface ComponentWrapperProps {
  metaVertex: Vertex;
  data?: Vertex;
  isNoPermissionCheck?: boolean;
}

/**
 * ComponentWrapper provides the necessary context and props handling
 * for rendering Component vertices. It wraps the component with proper
 * data context that includes the component's props from variant values.
 */
export function ComponentWrapper(props: ComponentWrapperProps) {
  const [graph, setGraph] = useGraph();
  const contextData = useDataContext() || {};
  const formStoreId = useDesignerFormIdContext();

  const values = createMemo(() => {
    const formStore = graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
    const componentValue = formStore?.P.componentValue
      ? graph.vertexes[formStore.P.componentValue]?.P
      : {};
    return {
      ...getComponentDefaultValues(props.metaVertex, graph, setGraph),
      ...deNullify(componentValue),
    };
  });

  const newDataContext = new Proxy(contextData, {
    get(target, key) {
      if (key === "props") {
        return values();
      }
      if (key === "index") {
        return 0;
      }
      return target[key];
    },
  });
  
  return (
    <DataContext.Provider value={newDataContext}>
      <PageAttrRender
        data={props.data}
        isNoPermissionCheck={props.isNoPermissionCheck!}
        metaVertex={props.metaVertex}
      />
    </DataContext.Provider>
  );
}