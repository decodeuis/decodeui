import { createMemo, createSignal } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { formSubmit } from "~/components/form/functions/formSubmit";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import { capturePreview } from "~/lib/playwright/capturePreview";
import { headerIconButtonCss } from "~/pages/settings/constants";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function SaveIconButton(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const [isSaving, setIsSaving] = createSignal(false);
  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const txnId = () => formStoreVertex()?.P.txnId;

  // Check if save is disabled
  const isDisabled = createMemo(
    () => isSaving() || (!!txnId() && isDisabledTxn(txnId()!, graph)),
  );

  // Get transaction status for UI enhancement
  const txnStatus = createMemo(() => {
    const txnVertex = graph.vertexes[`txn${txnId()}`];
    return txnVertex?.P?.status;
  });

  // Save handler with appropriate feedback
  const saveAndCaptureForm = async () => {
    setIsSaving(true);
    try {
      // Call form submit
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
        await capturePreview(formStoreVertex, graph, setGraph, showErrorToast);
      }

      return !formSubmitError;
    } finally {
      setIsSaving(false);
    }
  };

  // Get icon and tooltip based on transaction status
  const buttonProps = createMemo(() => {
    const status = txnStatus();

    if (isSaving()) {
      return {
        icon: "ph:spinner",
        title: "Saving...",
        css: [
          headerIconButtonCss,
          `return \`._id {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }\`;`,
        ],
      };
    }

    if (status === "modified") {
      return {
        icon: "ph:floppy-disk",
        title: "Save changes (Ctrl+S)",
        css: [
          headerIconButtonCss,
          `return \`._id {
            color: \${args.theme.var.color.orange_dark_600};
            &:hover {
              color: \${args.theme.var.color.orange_dark_500};
            }
          }\`;`,
        ],
      };
    }
    if (status === "reverted") {
      return {
        // icon: "ph:arrow-clockwise-bold",
        // title: "Restore changes (Ctrl+S)",
        icon: "ph:floppy-disk",
        title: "Save changes (Ctrl+S)",
        css: [
          headerIconButtonCss,
          `return \`._id {
            color: \${args.theme.var.color.blue_dark_600};
            &:hover {
              color: \${args.theme.var.color.blue_dark_500};
            }
          }\`;`,
        ],
      };
    }
    if (status === "error") {
      return {
        icon: "ph:warning-circle",
        title: "Error occurred",
        css: [
          headerIconButtonCss,
          `return \`._id {
            color: \${args.theme.var.color.red_dark_600};
            &:hover {
              color: \${args.theme.var.color.red_dark_500};
            }
          }\`;`,
        ],
      };
    }
    // Default for committed/idle states
    return {
      icon: "ph:floppy-disk",
      title: "Save (Ctrl+S)",
      css: headerIconButtonCss,
    };
  });

  return (
    <IconButton
      css={buttonProps().css}
      disabled={isDisabled()}
      icon={buttonProps().icon}
      onClick={isDisabled() ? undefined : saveAndCaptureForm}
      size={18}
      title={buttonProps().title}
      tooltipGroup="page-buttons"
    />
  );
}
