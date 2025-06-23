import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

export async function fetchComponentData(componentNames: string[]) {
  const componentData = await fetchComponentDataPure(componentNames);
  if (componentData?.graph) {
    // skip existing because we not want to modify existing component data
    // setGraphData(graph, setGraph, componentData.graph, { skipExisting: true });
  }
  return componentData;
}

export async function fetchComponentDataPure(
  componentNames: string[],
  // graph: GraphInterface,
) {
  const { incoming, outgoing } = getEdgesFromRowsAttr(
    FormMetaData.Component.attributes,
  );
  return await fetchDataFromDB(
    {
      expression: `g:'Component[$initial]'`,
      // [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    },
    {
      nodes: {},
      relationships: {},
      // @ts-expect-error ignore error
      $initial: { filter: { key: { $in: componentNames } } },
    },
  );
}
