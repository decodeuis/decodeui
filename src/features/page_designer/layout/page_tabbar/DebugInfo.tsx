import { Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { TransactionDetail } from "~/lib/graph/transaction/types/TransactionDetail";

import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function DebugInfo(props: { formStoreId: string }) {
  const [graph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const tnxVertex = () =>
    graph.vertexes[
      `txn${formStoreVertex()?.P.txnId}`
    ] as Vertex<TransactionDetail>;

  return (
    <Show
      when={formStoreVertex()?.P.txnId && getGlobalStore(graph).P.isDevelopment}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: row;
  gap: 2px;
}\`;`}
      >
        <span>Txn ID: {formStoreVertex()?.P.txnId}</span>
        <span>Steps: {tnxVertex()?.P.steps.length}</span>
        <span>Submitted Step: {tnxVertex()?.P.submittedIndex}</span>
        <span>Active Undo Point Index: {tnxVertex()?.P.activeUndoIndex}</span>
        <span>Undo Points: {tnxVertex()?.P.undoStepIndexes.join(", ")}</span>
      </As>
    </Show>
  );
}
