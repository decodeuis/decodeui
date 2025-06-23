import { createSignal, onCleanup, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ImportMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave?: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef: HTMLTextAreaElement;
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [htmlContent, setHtmlContent] = createSignal("");
  const [error] = createSignal("");
  const prevTxnIndex = getLastTxnIndex(formStoreVertex()?.P.txnId, graph);

  const metaVertexId = generateNewVertexId(graph, setGraph);
  const dataVertexId = generateNewVertexId(graph, setGraph);

  addNewVertex(
    0,
    { id: dataVertexId, IN: {}, L: [], OUT: {}, P: {} },
    graph,
    setGraph,
  );

  onCleanup(() => {
    deleteVertex(0, metaVertexId, graph, setGraph);
    deleteVertex(0, dataVertexId, graph, setGraph);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: graph.vertexes[formStoreVertex()?.P.formDataId!],
      jsx: htmlContent(),
      parent: graph.vertexes[formStoreVertex()?.P().selectedId],
      showWarnings: true,
      txnId: formStoreVertex()?.P.txnId,
    });
    jsxParser.render(graph, setGraph);
  };
  const onCancel = () => {
    if (prevTxnIndex !== -1) {
      revertTransactionUpToIndex(
        formStoreVertex()?.P.txnId,
        prevTxnIndex,
        graph,
        setGraph,
      );
    }
    props.onClose();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <DropdownMenu
      css={`return \`._id {
  padding: 0.50rem;
}\`;`}
      onClickOutside={props.onClose}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title="Import HTML" />
      <DialogSubTitle>Import HTML to the page.</DialogSubTitle>

      <div>
        <As
          as="label"
          css={`return \`._id {
  color: \${args.theme.var.color.primary};
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
          for="importHtml"
        >
          HTML
        </As>
        <As
          as="div"
          css={`return \`._id {
  margin-top: 2px;
}\`;`}
        >
          <As
            as="textarea"
            css={`return \`._id {
  border-radius: 0.375rem;
  border-width: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  color: \${args.theme.var.color.primary};
  display: block;
  font-size: 0.875rem;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.375rem; padding-bottom: 0.375rem;
  width: 100%;
}\`;`}
            id="importHtml"
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste HTML here"
            ref={nameInputRef!}
            value={htmlContent()}
          />
        </As>
      </div>
      <Show when={error()}>
        <As
          as="div"
          css={`return \`._id {
  color: \${args.theme.var.color.error};
}\`;`}
        >
          {error()}
        </As>
      </Show>

      <DialogFooter>
        <As
          as="button"
          css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
          disabled={!htmlContent()}
          onClick={onImport}
          type="button"
        >
          Import
        </As>
        <As
          as="button"
          css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </As>
      </DialogFooter>
    </DropdownMenu>
  );
}
