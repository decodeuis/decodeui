import { createSignal, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useToast } from "~/components/styled/modal/Toast";
import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "~/lib/meta/base/Comp";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

function TemplateNameInput(props: {
  label: string;
  value: string;
  onInput: (value: string) => void;
  ref: (el: HTMLInputElement) => void;
}) {
  return (
    <div>
      <As
        as="label"
        css={`return \`._id {
  color: \${args.theme.var.color.primary};
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
        for="templateName"
      >
        {props.label} Name
      </As>
      <As
        as="div"
        css={`return \`._id {
  margin-top: 2px;
}\`;`}
      >
        <As
          as="input"
          css={`return \`._id {
              border-radius: 0.375rem;
              border-width: 0;
              box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
              color: \${args.theme.var.color.primary};
              display: block;
              font-size: 0.875rem;
              padding: 0.375rem 0.75rem;
              width: 100%;
          }\`;`}
          id="templateName"
          onChange={(e) => props.onInput(e.target.value)}
          placeholder={`New ${props.label} Name`}
          ref={props.ref}
          type="text"
          value={props.value}
        />
      </As>
    </div>
  );
}

function SaveInCurrentPageCheckbox(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <As
      as="div"
      css={`return \`._id {
  margin-top: 2px;
}\`;`}
    >
      <As
        as="label"
        css={`return \`._id {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}\`;`}
      >
        <As
          as="input"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          type="checkbox"
        />
        <As
          as="span"
          css={`return \`._id {
  font-size: 0.875rem;
}\`;`}
        >
          Save in current page
        </As>
      </As>
    </As>
  );
}

export function SaveAsTemplateMenu(
  props: Readonly<{
    item: Vertex;
    onClickOutside?: () => void;
    onClose: () => void;
    onMouseLeave?: () => void;
    parentRef: HTMLElement;
    saveAsLabel: "Component" | "Template";
  }>,
) {
  let nameInputRef!: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const [templateName, setTemplateName] = createSignal("");
  const [error, setError] = createSignal("");
  const [saveInCurrentPage, _setSaveInCurrentPage] = createSignal(false);
  const { showSuccessToast, showWarningToast } = useToast();
  const label = () => props.saveAsLabel.replace(/Page$/, "");

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const saveTemplate = async () => {
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    const createResult = createFormVertex(
      graph,
      setGraph,
      newFormTxnId,
      props.saveAsLabel,
      { key: templateName() },
    );
    const dataVertex = createResult.vertex!;
    cloneLayoutAndChildren(
      props.item,
      dataVertex,
      newFormTxnId,
      formStoreVertex()?.P.txnId,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId || ""],
    );
    const parentComponentMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P:
        props.saveAsLabel === "Template"
          ? parentTemplateAttribute
          : parentComponentAttribute,
    } as Vertex;
    if (saveInCurrentPage()) {
      if (isNegative(formStoreVertex().P.formDataId)) {
        showWarningToast("Please Save Parent Page first.");
        return;
      }
      setSelectionValue(
        newFormTxnId,
        dataVertex,
        graph,
        setGraph,
        parentComponentMetaVertex,
        formStoreVertex().P.formDataId,
      );
    }
    const data = commitTxn(newFormTxnId, graph);

    if (!data) {
      showWarningToast("Internal Server Error");
      return;
    }

    try {
      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast(`${label()} Saved Successfully`);
      props.onClose();
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred");
    }
  };

  const saveAsTemplate = async (key: string) => {
    const res = await checkUniqueConstrains({
      L: [`${props.saveAsLabel}`],
      P: { key },
    } as unknown as Vertex);
    if (res.error) {
      setError(getErrorMessage(res));
      return;
    }
    saveTemplate();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <DropdownMenu
      css={`return \`._id {
  padding: 0.50rem;
}\`;`}
      onClickOutside={props.onClickOutside}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title={`Save As ${label()}`} />

      <DialogSubTitle>
        {label()} key must be unique. If the key already exists, you will be
        prompted to change it.
      </DialogSubTitle>

      <TemplateNameInput
        label={label()}
        value={templateName()}
        onInput={setTemplateName}
        ref={(el) => (nameInputRef = el)}
      />

      {/* <Show when={props.saveAsLabel !== "Template"}>
        <SaveInCurrentPageCheckbox 
          checked={saveInCurrentPage()} 
          onChange={setSaveInCurrentPage} 
        />
      </Show> */}

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

      <DialogFooter
        buttonText="Save"
        css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
        disabled={!templateName()}
        onClick={() => saveAsTemplate(templateName())}
      />
    </DropdownMenu>
  );
}
