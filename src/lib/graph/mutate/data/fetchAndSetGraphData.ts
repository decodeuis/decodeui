import type { SetStoreFunction } from "solid-js/store";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import {
  setGraphData,
  type UpdateOptions,
} from "~/lib/graph/mutate/core/setGraphData";

import { getGlobalStore } from "../../get/sync/store/getGlobalStore";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function fetchAndSetGraphData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  expression: string,
  context?: {
    [key: string]: any;
  },
  options?: UpdateOptions,
) {
  const result = await fetchDataFromDB(
    { expression, [getGlobalStore(graph).P.url]: true },
    context,
  );

  if (!isValidResponse(result)) {
    return { error: result.error || "Error When Loading Data" };
  }
  setGraphData(graph, setGraph, result.graph, options);

  return result;
}
