import type { SetStoreFunction } from "solid-js/store";

import { type Accessor, onCleanup } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SelectField } from "~/components/fields/select/SelectField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { evalExpression } from "~/lib/expression_eval";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { PROPERTIES } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";

// Deprecated - In future It can be used, so kept file
export function CollAndData() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const { metaTxnId, metaVertexId } = initializeMetaVertex(graph, setGraph);
  const attributes = createFieldAttributes(graph, formStoreVertex);

  addMetaVertexes(
    graph,
    setGraph,
    metaTxnId,
    graph.vertexes[metaVertexId],
    attributes,
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex =
    evalExpression("->Attr", {
      graph,
      setGraph,
      vertexes: [metaVertex],
    }) ?? [];
  const onCollectionChange = handleCollectionChange(
    graph,
    setGraph,
    formStoreVertex,
    collMetaVertex,
  );

  return (
    <>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
}\`;`}
      >
        <As
          as="span"
          css={`return \`._id {
  flex: 0.5;
  margin-top: 5px;
}\`;`}
        >
          Expression:{" "}
        </As>
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  font-size: 15px;
  flex: 1;
}\`;`}
        >
          <DynamicComponent
            data={graph.vertexes[formStoreVertex()?.P.selectedId]}
            disabled={false}
            isNoPermissionCheck={true}
            meta={collMetaVertex![2]}
            noLabel
            title={""}
            txnId={formStoreVertex()?.P.txnId}
          />
          {/* 
            <Icon icon="mdi:information-outline" noobserver css={`return \`._id {
  margin-left: 2px;
  cursor: pointer;
}\`;`} title="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used."/>
          */}
        </As>
      </As>

      <As
        as="div"
        css={`return \`._id {
  text-align: center;
  margin-bottom: 2px;
  margin-top: 2px;
}\`;`}
      >
        OR
      </As>
      <As
        as="span"
        css={`return \`._id {
  flex: 0.5;
  margin-top: 5px;
}\`;`}
      >
        Collection:
      </As>
      <SelectField
        componentName={"Select"}
        data={graph.vertexes[formStoreVertex()?.P.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex![0]}
        onChange={onCollectionChange}
        title={"Select Collection"}
        txnId={formStoreVertex()?.P.txnId}
      />
      <As
        as="span"
        css={`return \`._id {
  flex: 0.5;
  margin-top: 5px;
}\`;`}
      >
        Data:
      </As>
      <SelectField
        componentName={"MultiSelect"}
        data={graph.vertexes[formStoreVertex()?.P.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex![1]}
        title={"Select Data"}
        txnId={formStoreVertex()?.P.txnId}
      />
    </>
  );
}

function createFieldAttributes(
  graph: GraphInterface,
  formStoreVertex: Accessor<Vertex<FormStoreObject>>,
): FieldAttribute[] {
  return [
    {
      collection: "g:'ALL_LABELS'",
      componentName: "Select",
      displayName: "Collection",
      key: "collection",
      saveValue: true,
    },
    {
      collection: () =>
        graph.vertexes[formStoreVertex()?.P.selectedId]?.P?.collection
          ? `g:'${graph.vertexes[formStoreVertex()?.P.selectedId]?.P?.collection}'`
          : "",
      componentName: "Select",
      key: "data",
    },
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      key: "expression",
    },
  ];
}

function handleCollectionChange(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formStoreVertex: () => Vertex<FormStoreObject>,
  collMetaVertex: Vertex[],
) {
  return (value: string) => {
    setValueGlobal(
      graph,
      setGraph,
      formStoreVertex()?.P.txnId,
      collMetaVertex[0],
      graph.vertexes[formStoreVertex()?.P.selectedId],
      value,
      false,
    );
    setSelectionValue(
      formStoreVertex()?.P.txnId,
      graph.vertexes[formStoreVertex()?.P.selectedId],
      graph,
      setGraph,
      collMetaVertex[1],
      undefined,
    );
  };
}

function initializeMetaVertex(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const metaVertexId = generateNewVertexId(graph, setGraph);
  const metaTxnId = generateNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], {
      key: "Attr",
      label: "Attr",
      type: "Attr",
    }),
    graph,
    setGraph,
  );

  return { metaTxnId, metaVertexId };
}
