import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { deleteTxnId } from "~/lib/graph/transaction/core/deleteTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function formCancel(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  closePopUp: (action?: string) => void,
  navigate: (path: string) => void,
) {
  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };

  return () => {
    if (!formStoreVertex()) {
      return;
    }
    revertTransaction(formStoreVertex()?.P.txnId || 0, graph, setGraph);
    deleteTxnId(formStoreVertex()?.P.txnId || 0, graph, setGraph);
    if (closePopUp) {
      closePopUp();
    } else {
      navigateToParentRoute();
    }
  };
}

function removeLastPathSegment() {
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  segments.pop();
  return segments.join("/");
}
