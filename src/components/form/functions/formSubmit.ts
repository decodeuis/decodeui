import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function formSubmit(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  closePopUp: () => void,
  showErrorToast: (message: string) => void,
  showLoadingToast: (options: {
    loadMessage: string;
    onSuccess: (value: any) => void;
    promise: Promise<any>;
    successMessage: string;
  }) => void,
  showWarningToast: (message: string) => void,
) {
  return async (): Promise<string | undefined> => {
    const navigateToParentRoute = () => {
      // navigate(removeLastPathSegment());
    };

    const label = graph.vertexes[formStoreVertex().P.formDataId!]?.L[0]
      .replace(/([A-Z])/g, " $1")
      .trim();
    if (
      graph.vertexes[`txn${formStoreVertex().P.txnId}`]?.P.steps.length === 0
    ) {
      const warningMessage = `There is nothing to save for ${label}.`;
      showWarningToast(warningMessage);
      return warningMessage;
    }

    const txnId = formStoreVertex().P.txnId;
    if (isDisabledTxn(txnId, graph)) {
      const warningMessage = `${label} is already saved or not changed.`;
      showWarningToast(warningMessage);
      return warningMessage;
    }

    const isValid = true;
    const isRealTime = false;

    if (!isValid) {
      const warningMessage = "Please fix all errors";
      showWarningToast(warningMessage);
      return warningMessage;
    }

    let data;
    // TODO: add validation on form that AttrsTableData keys should not available.
    // !!!TODO!!! Handle Error Received From server when commit
    if (!isRealTime) {
      // Get the data to submit
      data = commitTxn(txnId, graph);

      if (!data) {
        const warningMessage = "No data to Submit";
        showWarningToast(warningMessage);
        return warningMessage;
      }

      // Check unique constraints
      const res = await checkUniqueConstrains(
        graph.vertexes[formStoreVertex().P.formDataId!],
      );

      if (!isValidResponse(res)) {
        const errorMessage = getErrorMessage(res);
        showErrorToast(errorMessage);
        return errorMessage;
      }

      await showLoadingToast({
        loadMessage: `Saving ${label}...`,
        onSuccess: (value) => {
          const responseData = value as {
            data: Array<{ insert?: [string, string] }>;
          };

          for (const item of responseData.data) {
            if (item.insert) {
              if (item.insert[0] === formStoreVertex().P.formDataId) {
                mergeVertexProperties<FormStoreObject>(
                  0,
                  formStoreVertex().id,
                  graph,
                  setGraph,
                  { formDataId: item.insert[1] },
                );
              }
            }
          }

          // currently we are navigating back.
          if (closePopUp) {
            closePopUp();
          } else {
            navigateToParentRoute();
          }
        },
        promise: submitDataCall(
          data,
          graph,
          setGraph,
          formStoreVertex().P.txnId,
        ),
        successMessage: `${label} Saved Successfully`,
      });
    }

    if (!data) {
      if (closePopUp) {
        closePopUp();
      } else {
        navigateToParentRoute();
      }
      return;
    }

    return;
  };
}
