import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/steps/setPreventUndoAtOrBeforeIndex";
import { saveNamedStepIndex } from "~/lib/graph/transaction/steps/saveNamedStepIndex";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "~/lib/meta/base/Comp";
import type { FetchFormDataResult } from "../functions/fetchPageData";
import type { Accessor } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageViewWrapperProps } from "~/pages/PageViewWrapper/types";

interface UseFormDataOptions {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  id: Accessor<Id | undefined>;
  setFormStore: (key: string, value: unknown) => void;
  formStore: () => Vertex<FormStoreObject>;
  metaVertex: () => Vertex | undefined;
  createErrorVertex: (dataId: string) => string;
}

export function useFormData(
  props: Readonly<PageViewWrapperProps>,
  options: UseFormDataOptions,
) {
  function handleFormData(result?: FetchFormDataResult) {
    if (props.formDataId) {
      options.setFormStore("formDataId", props.formDataId);
      return;
    }

    const formDataId = result?.data?.result?.[0]?.id;
    if (!(options.id() || formDataId)) {
      const createResult = createFormVertex(
        options.graph,
        options.setGraph,
        options.formStore().P.txnId,
        options.metaVertex()!.P.key,
        options.metaVertex()!.P.key === "Page"
          ? { fns: "return { enabled: () => true }" }
          : {},
      );

      if (createResult.error) {
        options.setFormStore("error", createResult.error);
        return;
      }
      // we cant save the dataId again, because its used as a prop and giving some error
      // if (props.openedFormId) {
      //   mergeVertexProperties(0, props.openedFormId, graph, setGraph, {
      //     dataId: createResult.vertex!.id
      //   });
      // }
      // Link to parent page
      if (
        props.parentId &&
        (props.pageVertexName === "Template" ||
          props.pageVertexName === "Component")
      ) {
        const parentComponentMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P:
            props.pageVertexName === "Template"
              ? parentTemplateAttribute
              : parentComponentAttribute,
        } as Vertex;
        setSelectionValue(
          options.formStore().P.txnId,
          createResult.vertex!,
          options.graph,
          options.setGraph,
          parentComponentMetaVertex,
          props.parentId,
        );
      }

      options.setFormStore("formDataId", createResult.vertex!.id);
    }

    if (!(props.parentId || props.txnId) && props.isDesignMode) {
      setPreventUndoAtOrBeforeIndex(
        options.formStore().P.txnId,
        options.graph,
        options.setGraph,
      );
    }
    saveNamedStepIndex(
      options.formStore().P.txnId,
      "initial",
      options.graph,
      options.setGraph,
    );
    saveUndoPoint(options.formStore().P.txnId, options.graph, options.setGraph);

    if (!result) {
      return;
    }
    if (result.error) {
      options.setFormStore("error", result.error);
      return;
    }
    if (result.data?.graph) {
      // if we don't skip existing, if component is already added in the page, and we open in new tab, and modify it not updating existing components.
      setGraphData(options.graph, options.setGraph, result.data.graph, {
        skipExisting: true,
      });
    }
    if (result.componentData?.length) {
      for (const componentData of result.componentData) {
        if (componentData.graph) {
          setGraphData(options.graph, options.setGraph, componentData.graph, {
            skipExisting: true,
          });
        }
      }
    }

    if (formDataId) {
      options.setFormStore("formDataId", formDataId);
      options.createErrorVertex(formDataId);
    }
  }

  return {
    handleFormData,
  };
}
