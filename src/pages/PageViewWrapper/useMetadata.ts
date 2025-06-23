import { createAsync } from "@solidjs/router";
import { untrack } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { isObject } from "~/lib/data_structure/object/isObject";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import {
  fetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
} from "../functions/fetchPageData";
import { fetchFormMetaData } from "../functions/fetchFormMetaData";
import type { PageViewConstants, PageViewWrapperProps } from "./types";
import type { PreviewStoreObject } from "~/features/page_designer/context/PreviewContext";
import type { SetStoreFunction } from "solid-js/store";

interface UseMetadataOptions {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  constants: PageViewConstants;
  setFormStore: (key: string, value: unknown) => void;
  metaTxnId: number;
  previewStore: PreviewStoreObject;
}

export function useMetadata(
  props: Readonly<PageViewWrapperProps>,
  options: UseMetadataOptions,
) {
  const metaData = createAsync(
    async () => {
      if (options.constants.pageKeyName === "favicon.ico") {
        return { error: "No meta data found" };
      }
      if (options.constants.formMetaId) {
        if (props.getFormData) {
          try {
            const data = await props.getFormData();
            if (!data || data.error) {
              return { error: data?.error || "Error fetching form data" };
            }
            return { dataResult: { data } };
          } catch (error) {
            return { error: (error as Error).message };
          }
        }
        return {};
      }
      const metaResult = await fetchFormMetaData(
        options.constants.pageVertexName,
        options.constants.formId,
        options.constants.expression,
        options.constants.isDesignMode,
        options.constants.pageKeyName,
        options.constants.url,
      );
      if (!metaResult) {
        return { error: "404" };
      }
      if (metaResult.error) {
        return metaResult;
      }

      let formMetaId = options.constants.formMetaId;
      if (metaResult.data) {
        if (Array.isArray(metaResult.data.result)) {
          if (metaResult.data.result.length > 0) {
            formMetaId = metaResult.data.result[0].id;
          }
        } else if (isObject(metaResult.data.result)) {
          formMetaId = metaResult.data.result.id;
        }
      }

      const metaVertex = options.constants.formMetaId
        ? options.graph.vertexes[options.constants.formMetaId]
        : metaResult.data?.graph?.vertexes[formMetaId!];

      const isNoPermissionCheck =
        options.constants.isNoPermissionCheck ||
        metaVertex?.P?.isNoPermissionCheck ||
        options.previewStore.isNoPermissionCheck;

      const idLocal =
        options.constants.dataId === "new"
          ? undefined
          : options.constants.dataId;

      if (idLocal && !options.constants.getFormData) {
        const dataResult = await fetchFormData(
          options.graph,
          metaResult,
          options.constants.formDataId,
          idLocal,
          isNoPermissionCheck,
          true,
          options.constants.pageVertexName,
        );
        return { dataResult, formMetaId, metaResult };
      }

      let result: {
        formMetaId?: string;
        metaResult?: FetchFormMetaDataResult;
        dataResult?: FetchFormDataResult;
        error?: string;
      } = { formMetaId, metaResult };

      if (props.getFormData) {
        try {
          const data = await props.getFormData();
          if (!data || data.error) {
            result = {
              ...result,
              error: data.error || "Error fetching form data",
            };
          } else {
            result = { ...result, dataResult: { data } };
          }
        } catch (error) {
          result = { ...result, error: (error as Error).message };
        }
      }
      return result;
    },
    { deferStream: true },
  );

  function setFormMetaData(
    metaResult?: FetchFormMetaDataResult,
    formMetaId?: string,
  ) {
    if (props.formMetaId) {
      options.setFormStore("formMetaId", props.formMetaId);
      return true;
    }
    if (!metaResult) {
      return false;
    }
    if (metaResult.error) {
      options.setFormStore("error", metaResult.error);
      return false;
    }

    if (metaResult.data) {
      if (
        options.constants.formId &&
        options.graph.vertexes[options.constants.formId]
      ) {
        delete metaResult.data.graph!.vertexes[options.constants.formId];
      }
      setGraphData(options.graph, options.setGraph, metaResult.data.graph!);
    }

    // Process componentData from metaResult
    if (metaResult.componentData?.length) {
      for (const componentData of metaResult.componentData) {
        if (componentData.graph) {
          setGraphData(options.graph, options.setGraph, componentData.graph, {
            skipExisting: true,
          });
        }
      }
    }

    if (formMetaId) {
      options.setFormStore("formMetaId", formMetaId);
    }
    const form = metaResult.form;
    if (!(props.formMetaId || formMetaId || form)) {
      options.setFormStore(
        "error",
        `${options.constants.pageVertexName} is not configured`,
      );
      return false;
    }
    if (form) {
      let formToUse = form;
      // improve performance only
      if (PageDesignerLabels.includes(form.key!) || form.key === "Component") {
        formToUse = {
          ...form,
          attributes: form.attributes.map((attr) => ({
            ...attr,
            attributes: attr.attributes?.filter((a) => a.key !== "Attr"),
          })),
        };
      }

      const metaVertexResult = untrack(() =>
        createMeta(
          formToUse!,
          options.metaTxnId,
          options.graph,
          options.setGraph,
        ),
      );

      if (metaVertexResult.error) {
        return false;
      }
      options.setFormStore("formMetaId", metaVertexResult.vertex!.id);
    }
    return true;
  }

  return {
    metaData,
    setFormMetaData,
  };
}
