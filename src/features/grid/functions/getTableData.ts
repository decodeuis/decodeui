import type { Store } from "solid-js/store";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function getTableData(
  graph: Store<GraphInterface>,
  form: IFormMetaData,
  tableId: string,
  skip?: number,
  limit?: number,
  ignoreTables = true,
) {
  try {
    const { incoming, outgoing } = getEdgesFromRowsAttr(
      form.attributes,
      ignoreTables,
    );

    const result = await fetchDataFromDB(
      {
        expression: `g:'${tableId}[$1]'`,
        [getGlobalStore(graph).P.url]: true,
        incoming,
        outgoing,
      },
      {
        $1: {
          filter: "",
          limit: limit,
          skip: skip,
        },
        nodes: {} as { [key: string]: any },
        relationships: {} as { [key: string]: any },
        vertexes: undefined as any,
      },
    );
    return result;
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form2: ${e.message}` };
  }
}
