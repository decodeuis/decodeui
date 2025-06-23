import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { SetStoreFunction } from "solid-js/store";
import type { Navigator } from "@solidjs/router";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { capturePreview } from "~/lib/playwright/capturePreview";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Saves a form and captures a preview
 * @param formStoreVertex Function that returns the form store vertex
 * @param graph Current graph state
 * @param setGraph Graph setter function
 * @param showErrorToast Error toast function
 * @param showLoadingToast Loading toast function
 * @param showWarningToast Warning toast function
 * @param updateUrl Whether to update URL after saving (for main forms)
 * @returns Promise<boolean> indicating success
 */
export const saveAndCaptureForm = async (
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
  showLoadingToast: (options: {
    loadMessage: string;
    onSuccess: (value: any) => void;
    promise: Promise<any>;
    successMessage: string;
  }) => void,
  showWarningToast: (message: string) => void,
  navigate: Navigator,
  updateUrl = false,
) => {
  // Save the form
  const formSubmitError = await formSubmit(
    formStoreVertex,
    graph,
    setGraph,
    () => {},
    showErrorToast,
    showLoadingToast,
    showWarningToast,
  )();

  // If form saved successfully, capture preview
  if (!formSubmitError) {
    const previewResult = await capturePreview(
      formStoreVertex,
      graph,
      setGraph,
      showErrorToast,
    );

    // Update URL if needed and form was saved successfully
    if (updateUrl) {
      const formDataId = formStoreVertex().P.formDataId;
      if (formDataId) {
        const currentPath = window.location.pathname;
        if (currentPath.includes("/new")) {
          // Create new URL with the format /admin/EntityType/id
          const urlParts = currentPath.split("/new");
          const newUrl = `${urlParts[0]}/${formDataId}`;

          // Replace URL using navigate
          navigate(newUrl, { replace: true });
        }
      }
    }

    return previewResult;
  }

  return false;
};
