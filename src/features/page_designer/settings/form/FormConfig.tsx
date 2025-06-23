import { createMemo, For, Suspense } from "solid-js";

import { getExistingOrDefaultTxnValue } from "~/lib/graph/transaction/value/getExistingOrDefaultTxnValue";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import type { Id } from "~/lib/graph/type/id";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FormConfig() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const _TransactionDebugView = (props: { openedFormId: Id }) => {
    const txnId = () =>
      graph.vertexes[graph.vertexes[props.openedFormId].P.formId].P.txnId;

    const memoizedTxnValue = createMemo(() => {
      return getExistingOrDefaultTxnValue(txnId(), graph);
    });

    // Create a display copy for UI without modifying the original
    const displaySteps = createMemo(() => {
      const steps = memoizedTxnValue().steps || [];
      // Instead of modifying the steps, we'll create a new array for display
      return steps.map((step) => {
        // We intentionally extract and omit the originalData property to save memory
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { originalData, ...essentialData } = step;
        return essentialData;
      });
    });

    // Get colored status indicator
    const getStatusColor = () => {
      const status = memoizedTxnValue().status;
      switch (status) {
        case "modified":
          return "theme.var.color.orange_dark_600";
        case "reverted":
          return "theme.var.color.blue_dark_600";
        case "committed":
          return "theme.var.color.green_dark_600";
        case "error":
          return "theme.var.color.red_dark_600";
        default:
          return "theme.var.color.gray_dark_600";
      }
    };

    // Format transaction info stats
    const getTxnStats = () => {
      const txn = memoizedTxnValue();
      return {
        activeIndex: txn.activeUndoIndex,
        totalSteps: txn.steps.length,
        submittedIndex: txn.submittedIndex,
        originalSubmittedIndex: txn.originalSubmittedIndex,
        undoAvailable: txn.activeUndoIndex >= 0,
        redoAvailable: txn.activeUndoIndex < txn.steps.length - 1,
        status: txn.status,
        lastModified: txn.lastModified
          ? new Date(txn.lastModified).toLocaleString()
          : "Unknown",
      };
    };

    const txnStats = createMemo(() => getTxnStats());

    return (
      <div
        class="transaction-debug"
        style={{
          "margin-top": "20px",
          border: `1px solid ${(args) => args.theme.var.color.gray_light_700}`,
          "border-radius": "4px",
          padding: "12px",
          "background-color": `${(args) => args.theme.var.color.gray_light_900}`,
          "font-family": "monospace",
        }}
      >
        <h3
          style={{
            display: "flex",
            "align-items": "center",
            gap: "8px",
            "margin-top": "0",
          }}
        >
          <span>Transaction State</span>
          <span
            style={{
              display: "inline-block",
              padding: "3px 8px",
              "border-radius": "12px",
              "font-size": "12px",
              "background-color": `${(args) => args.theme.var.color[getStatusColor().split(".").pop() || ""]}`,
              color: "white",
            }}
          >
            {memoizedTxnValue().status}
          </span>
        </h3>

        <div
          class="transaction-summary"
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            gap: "8px",
            "margin-bottom": "12px",
          }}
        >
          <div>Steps: {txnStats().totalSteps}</div>
          <div>Current Position: {txnStats().activeIndex}</div>
          <div>Submitted Index: {txnStats().submittedIndex}</div>
          <div>Original Submitted: {txnStats().originalSubmittedIndex}</div>
          <div>Last Modified: {txnStats().lastModified}</div>
          <div>
            Actions:
            <span
              style={{
                color: txnStats().undoAvailable
                  ? `${(args) => args.theme.var.color.blue_dark_600}`
                  : `${(args) => args.theme.var.color.gray_light_500}`,
              }}
            >
              {txnStats().undoAvailable ? " Undo" : " No Undo"}
            </span>{" "}
            /
            <span
              style={{
                color: txnStats().redoAvailable
                  ? `${(args) => args.theme.var.color.blue_dark_600}`
                  : `${(args) => args.theme.var.color.gray_light_500}`,
              }}
            >
              {txnStats().redoAvailable ? "Redo" : "No Redo"}
            </span>
          </div>
        </div>

        <div style={{ "max-height": "400px", overflow: "auto" }}>
          <pre
            style={{
              "font-size": "12px",
              margin: "0",
            }}
          >
            {/* Display a simplified version without originalData */}
            {JSON.stringify(
              {
                ...memoizedTxnValue(),
                steps: displaySteps(),
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <Suspense>
      <For each={layoutStore().openedFormIds}>
        {(openedFormId) => (
          <div
            style={{
              display:
                layoutStore().formId === graph.vertexes[openedFormId].P.formId
                  ? "block"
                  : "none",
            }}
          >
            <PageViewWrapper
              dataId={graph.vertexes[openedFormId].P.dataId}
              formDataId={graph.vertexes[openedFormId].P.formDataId}
              hideSaveCancelButton={true}
              isDesignMode={true}
              isNoPermissionCheck={true}
              pageVertexName={graph.vertexes[openedFormId].P.label}
              parentId={graph.vertexes[openedFormId].P.parentId}
              txnId={graph.vertexes[openedFormId].P.txnId}
              uuid={graph.vertexes[openedFormId].P.formId}
            />
            {/* <TransactionDebugView openedFormId={openedFormId} /> */}
          </div>
        )}
      </For>
    </Suspense>
  );
}
