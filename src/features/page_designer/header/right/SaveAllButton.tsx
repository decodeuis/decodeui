import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { saveAndCaptureForm } from "~/features/page_designer/utils/saveAndCapture";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function SaveAllButton() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const layoutStoreId = useDesignerLayoutStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = createSignal(false);
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  const formStoreIds = () => layoutStore().openedFormIds.slice().reverse();

  const isDisabled = (formId: Id) => {
    const formStoreVertex = () =>
      graph.vertexes[formId] as Vertex<FormStoreObject>;
    const txnId = () => formStoreVertex()?.P.txnId;
    return !!txnId() && isDisabledTxn(txnId()!, graph);
  };

  const handleSaveAndCaptureForm = async (openFormData: Id) => {
    const formStoreVertex = () =>
      graph.vertexes[
        graph.vertexes[openFormData].P.formId
      ] as Vertex<FormStoreObject>;

    // Check if this is the main form
    const isMainForm =
      layoutStore().mainFormId === graph.vertexes[openFormData].P.formId;

    // Save the form and capture preview using the global function
    return await saveAndCaptureForm(
      formStoreVertex,
      graph,
      setGraph,
      showErrorToast,
      showLoadingToast,
      showWarningToast,
      navigate,
      isMainForm, // Update URL only if it's the main form
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const idsToSave = formStoreIds().filter(
        (openFormData) => !isDisabled(graph.vertexes[openFormData].P.formId),
      );

      // Process forms sequentially to avoid UI conflicts
      for (const openFormData of idsToSave) {
        await handleSaveAndCaptureForm(openFormData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IconButton
      css={
        isSaving()
          ? [
              headerIconButtonCss,
              `return \`._id {
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }\`;`,
            ]
          : headerIconButtonCss
      }
      disabled={
        isSaving() ||
        formStoreIds().every((openFormData) =>
          isDisabled(graph.vertexes[openFormData].P.formId),
        )
      }
      icon={isSaving() ? "ph:spinner" : "ic:baseline-save-all"}
      onClick={
        isSaving() ||
        formStoreIds().every((openFormData) =>
          isDisabled(graph.vertexes[openFormData].P.formId),
        )
          ? undefined
          : handleSaveAll
      }
      size={22}
      title={isSaving() ? "Saving..." : "Save All"}
      tooltipGroup="right-buttons"
    />
  );
}
