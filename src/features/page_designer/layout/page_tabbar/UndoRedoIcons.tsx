import { For, createMemo } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { redo, redoAllowed } from "~/lib/graph/transaction/history/redo";
import { undo, undoAllowed } from "~/lib/graph/transaction/history/undo";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function UndoRedoIcons(props: { formStoreId: string }) {
  const [graph, setGraph] = useGraph();

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;

  // Get transaction details
  const txnId = () => formStoreVertex()?.P.txnId;
  const txnVertex = () =>
    txnId() ? graph.vertexes[`txn${txnId()}`] : undefined;
  const txnStatus = () => txnVertex()?.P?.status;

  // Create transaction state info for tooltips
  const transactionInfo = createMemo(() => {
    if (!txnVertex()) {
      return { undoSteps: 0, redoSteps: 0, statusText: "" };
    }

    const txn = txnVertex()?.P;
    if (!txn) {
      return { undoSteps: 0, redoSteps: 0, statusText: "" };
    }

    const totalSteps = txn.steps.length;
    const activeIndex = txn.activeUndoIndex;

    // Calculate how many steps can be undone and redone
    const undoSteps = activeIndex + 1;
    const redoSteps = totalSteps - activeIndex - 1;

    // Status text for tooltip
    let statusText = "";
    if (txn.status === "modified") {
      statusText = "Unsaved changes";
    } else if (txn.status === "reverted") {
      statusText = "Reverted changes";
    } else if (txn.status === "error") {
      statusText = "Error state";
    } else if (txn.status === "committed") {
      statusText = "All changes saved";
    }

    return {
      undoSteps,
      redoSteps,
      statusText,
    };
  });

  // Enhanced with visual indicators for transaction status
  const icons = [
    {
      disabled: () => !undoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-counter-clockwise",
      onClick: () => undo(formStoreVertex()?.P.txnId, graph, setGraph),
      getTooltip: () => {
        const info = transactionInfo();
        const undoTooltip = "Undo (Ctrl+Z)";

        if (info.undoSteps > 0) {
          return `${undoTooltip} - ${info.undoSteps} ${info.undoSteps === 1 ? "step" : "steps"} available`;
        }

        return undoTooltip;
      },
      getCss: () => {
        // When there are uncommitted or reverted changes, highlight undo button
        const status = txnStatus();
        if (status === "modified" || status === "reverted") {
          return [
            headerIconButtonCss,
            `return \`._id {
            color: \${args.theme.var.color.primary};
            &:hover:not(:disabled) {
              color: \${args.theme.var.color.primary_light_200};
            }
          }\`;`,
          ];
        }
        return headerIconButtonCss;
      },
    },
    {
      disabled: () => !redoAllowed(formStoreVertex()?.P.txnId, graph),
      icon: "ph:arrow-clockwise",
      onClick: () => redo(formStoreVertex()?.P.txnId, graph, setGraph),
      getTooltip: () => {
        const info = transactionInfo();
        const redoTooltip = "Redo (Ctrl+Y)";

        if (info.redoSteps > 0) {
          return `${redoTooltip} - ${info.redoSteps} ${info.redoSteps === 1 ? "step" : "steps"} available`;
        }

        return redoTooltip;
      },
      getCss: () => {
        // Check if there are steps that can be redone
        const isRedoAvailable = redoAllowed(formStoreVertex()?.P.txnId, graph);
        if (isRedoAvailable) {
          return [
            headerIconButtonCss,
            `return \`._id {
            color: \${args.theme.var.color.primary};
            &:hover:not(:disabled) {
              color: \${args.theme.var.color.primary_light_200};
            }
          }\`;`,
          ];
        }
        return headerIconButtonCss;
      },
    },
  ];

  return (
    <As
      as="div"
      css={`return \`._id {
        margin-left: 2px;
        display: flex;
        align-items: center;
        gap: 2px;
        position: relative;
      }\`;`}
    >
      <For each={icons}>
        {(item) => (
          <IconButton
            css={item.getCss()}
            disabled={item.disabled()}
            icon={item.icon}
            onClick={item.onClick}
            size={18}
            title={item.getTooltip()}
            tooltipGroup="page-buttons"
          />
        )}
      </For>
      {/* <StatusIndicator /> */}
    </As>
  );
}
