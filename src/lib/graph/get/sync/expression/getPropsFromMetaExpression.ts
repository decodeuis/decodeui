import type { SetStoreFunction, Store } from "solid-js/store";

import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getPropsFromMetaExpression(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex,
) {
  const meta = metaVertex.P.meta;
  if (!meta) {
    return {};
  }

  const metaRows =
    evalExpression(meta, {
      graph,
      vertexes: [data],
    }) || [];
  return getComponentProperties(graph, setGraph, metaRows);
}

function getComponentProperties(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaRows: Vertex[],
) {
  const metaData = metaRows.reduce(
    (acc, curr) => {
      const key = evalExpression("->$0Name::'P.key'||::'P.key'", {
        graph,
        setGraph,
        vertexes: [curr],
      });
      if (key && curr.P.value !== undefined) {
        acc[key] = curr.P.value;
      }
      return acc;
    },
    {} as { [key: string]: any },
  );
  return metaData;
}
