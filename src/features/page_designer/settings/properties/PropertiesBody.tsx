import { Show } from "solid-js";
import { untrack } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { FunctionEditor } from "~/features/page_designer/settings/properties/FunctionEditor";
import { evalExpression } from "~/lib/expression_eval";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { ComponentVariantsInput } from "./ComponentVariantsInput";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function PropertiesBody() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const selectedAttr = () => graph.vertexes[formStoreVertex()?.P.selectedId];
  const selectedComp = () =>
    selectedAttr()?.P.componentName
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          selectedAttr().P.componentName,
        )
      : undefined;
  const clearFileSelection = (meta: Vertex) => {
    const txnId = formStoreVertex()?.P.txnId;
    if (!txnId) {
      return;
    }

    setSelectionValue(
      txnId,
      graph.vertexes[formStoreVertex()?.P.selectedId],
      graph,
      setGraph,
      meta,
    );
  };

  const setPropertyValue = (meta: Vertex, value: unknown) => {
    if (formStoreVertex()?.P.selectedId !== -1) {
      untrack(() => {
        mergeVertexProperties(
          formStoreVertex()?.P.txnId,
          graph.vertexes[formStoreVertex()?.P.selectedId].id,
          graph,
          setGraph,
          {
            [meta.P.key]: value,
          },
        );
      });
      if (value === null) {
        clearFileSelection(meta);
      }
      saveUndoPoint(formStoreVertex()?.P.txnId, graph, setGraph);
    }
  };

  const selectedComponentProperties = () => {
    const compVertex = selectedComp();
    if (!compVertex) {
      return [];
    }
    return evalExpression("->$0Prop", {
      graph,
      setGraph,
      vertexes: [compVertex],
    });
  };

  return (
    <Show
      when={
        formStoreVertex()?.P.selectedId !== -1 &&
        graph.vertexes[formStoreVertex()?.P.selectedId]
      }
    >
      {/* <As as="div" css={`return \`._id {
  display: flex;
  gap: 2px;
  justify-content: start;
}\`;`}>
      <button onClick={toggleImportsModal}>Import HTML</As>
      </As> */}

      {/* <Show when={selectedAttr()?.P.componentName === "Data"}>
        <CollAndData />
      </Show> */}

      <FunctionEditor
        keyName="fns"
        label="Function Definitions"
        setPropertyValue={setPropertyValue}
      />
      <FunctionEditor
        keyName="props"
        label="Props Function"
        setPropertyValue={setPropertyValue}
      />

      <Show when={selectedAttr()?.P.componentName === "Component"}>
        <ComponentVariantsInput
          compVertex={selectedComp()}
          dataVertex={graph.vertexes[formStoreVertex()?.P.selectedId]}
          setPropertyValue={setPropertyValue}
        />
      </Show>

      <Show
        when={graph.vertexes[formStoreVertex()?.P.selectedId].L?.[0]?.endsWith(
          "Attr",
        )}
      >
        <FormGroupProperties
          metaAttributes={selectedComponentProperties() ?? []}
          onChange={setPropertyValue}
          selectedLayout={graph.vertexes[formStoreVertex()?.P.selectedId]}
          txnId={formStoreVertex()?.P.txnId}
        />
      </Show>
      {/* <JsonEditorFieldComponent 
        // height="400px" 
        replaceProperties={replacePropertiesValue}
      /> */}
    </Show>
  );
}
