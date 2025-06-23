import { createMemo, onCleanup } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

import {
  FormContext,
  type FormStoreObject,
  useFormContext,
} from "../form/context/FormContext";
import { getFormData } from "../form/functions/getFormData";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

// TODO: make this update when props.id and props.label changes
export function FormField(
  props: Readonly<{
    formDataId?: string;
    id?: string;
    isNoPermissionCheck?: boolean;
    // For Root Level Forms we use Parent vertex label as form key
    label?: string;
    submitButton?: any;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [previewStore] = usePreviewContext();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const _data = () => parentRenderContext()?.context.data!;
  const txnId = generateNewTxnId(graph, setGraph);
  // TODO: Cleanup txn on unMount
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;

  const pageFormVertexObject = newVertex(uuidv7(), ["PageForm"], {
    txnId,
  });

  addNewVertex(0, pageFormVertexObject, graph, setGraph);

  onCleanup(() => {
    deleteVertex(0, pageFormVertexObject.id, graph, setGraph);
  });

  const id = createMemo(() => props.id ?? formVertex()?.P.id);
  const label = createMemo(
    () =>
      props.label ?? previewStore.previewMeta?.P[IdAttr] ?? meta().P[IdAttr],
  );

  const formStore = () =>
    graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;
  const setFormStore = (key: string, value: any) => {
    mergeVertexProperties<FormStoreObject>(
      0,
      pageFormVertexObject.id,
      graph,
      setGraph,
      { [key]: value },
    );
  };

  // const form = generateFormMetaAttributes(graph, () => {}, meta());
  // setFormStore("formMetaData", form);

  async function initForm() {
    if (props.formDataId) {
      setFormStore("formDataId", props.formDataId);
      return;
    }
    if (id()) {
      loadData();
    } else {
      // const defaultValues = form.attributes.reduce(
      //   (acc, attr) => {
      //     acc[attr.key] = attr.defaultValue;
      //     return acc;
      //   },
      //   {} as { [key: string]: any },
      // );
      const defaultValues = {};
      const createResult = createFormVertex(
        graph,
        setGraph,
        formStore().P.txnId,
        label(),
        defaultValues,
      );
      if (createResult.error) {
        setFormStore("error", createResult.error);
        return;
      }
      mergeVertexProperties<FormStoreObject>(
        0,
        pageFormVertexObject.id,
        graph,
        setGraph,
        {
          formDataId: createResult.vertex!.id,
          formMetaId: meta().id,
          txnId,
        },
      );
    }
  }

  initForm();

  async function loadData() {
    if (!id()) {
      return;
    }
    try {
      return;
      // TODO: make this work
      const { data, error } = await getFormData(graph, { form: meta() }, id()!);

      if (error || !Array.isArray(data?.result) || data.result.length === 0) {
        setFormStore("error", `No ${label()} found`);
        return;
      }

      setGraphData(graph, setGraph, data!.graph!);
      setFormStore("formDataId", data!.result[0].id);
    } catch (e: any) {
      setFormStore("error", `Error When Loading Page: ${e.message}`);
    }
  }

  return (
    <FormContext.Provider value={pageFormVertexObject.id}>
      <div class="">
        <PageAttrRender
          data={graph.vertexes[formStore().P.formDataId!]}
          isNoPermissionCheck={props.isNoPermissionCheck!}
          metaVertex={meta()!}
        />
      </div>
      <div />
    </FormContext.Provider>
  );
}
