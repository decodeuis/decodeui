import type { SetStoreFunction } from "solid-js/store";

import type { MongoFilter } from "~/cypher/queries/evaluate/mongoToCypher";

import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function getRootData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  parentVertexLabel: string,
  filter: MongoFilter,
) {
  return await fetchAndSetGraphData(
    graph,
    setGraph,
    `g:'${parentVertexLabel}[$1]'`,
    { $1: { filter }, nodes: {}, relationships: {} },
  );
}
