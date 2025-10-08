import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import type { FetchFormMetaDataResult } from "./fetchPageData";
import { fetchComponentDataFromGraph } from "./fetchComponentData";

export async function fetchFormMetaData(
  // graph: GraphInterface,
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  isDesignMode?: boolean,
  pageKeyName?: string,
  url?: string,
  skipComponentData?: boolean,
): Promise<FetchFormMetaDataResult> {
  "use server";
  let form: IFormMetaData | null = null;
  if (isDesignMode) {
    const form = FormMetaData[pageVertexName!];
    // can't return form, if it contins functions
    return { form };
  } else if (pageVertexName === "Function") {
    const form = FormMetaData[pageVertexName!];
    return { form };
  }
  form = FormMetaData[pageVertexName ?? "Page"] || FormMetaData.Page;
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

  const data = await fetchDataFromDB(
    {
      expression:
        expression ??
        (formId
          ? `id:'${formId}'`
          : url
            ? `g:'${pageVertexName ?? "Page"}[$urlFilter]'`
            : `g:'${pageVertexName ?? "Page"}[${pageKeyName}]'`),
      // [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    },
    {
      nodes: {},
      relationships: {},
      // @ts-expect-error ignore error
      $urlFilter: { filter: { url: url } },
    },
  );

  if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
    return { error: "404" };
  }

  if (skipComponentData) {
    return { data };
  }

  const componentDataResults = await fetchComponentDataFromGraph(data);

  return { data, componentData: componentDataResults };
}
