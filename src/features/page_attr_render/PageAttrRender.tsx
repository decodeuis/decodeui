import { createMemo, For } from "solid-js";

import {
  type FormStoreObject,
  useFormContext,
} from "~/components/form/context/FormContext";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";

import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PageAttrRender(
  props: Readonly<{
    data?: Vertex;
    filter?: (vertex: Vertex) => boolean;
    isNoPermissionCheck: boolean;
    metaVertex: Vertex;
    class?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;

  const childrenAttrs = createMemo(() => {
    const attrs = getChildrenAttrs(graph, setGraph, props.metaVertex);
    return props.filter ? attrs.filter(props.filter) : attrs;
  });

  return (
    <For each={childrenAttrs()}>
      {(item) => (
        <DynamicComponent
          // data={props.data || getDataVertex(item) || parentData()}
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck}
          // onChange={props.onChange}
          meta={item}
          txnId={formVertex()?.P.txnId}
          class={props.class}
        />
      )}
    </For>
  );
}
