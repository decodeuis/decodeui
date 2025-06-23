import { useNavigate } from "@solidjs/router";
import { type JSXElement, Show } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { useToast } from "../styled/modal/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { formCancel } from "./functions/formCancel";
import { formSubmit } from "./functions/formSubmit";
import { As } from "../As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

// Deprecated - just added for submit button reference
export function SaveCancelButton(
  props: Readonly<{
    buttonAlign?: string;
    closePopUp?: () => void;
    customSubmitButton?: JSXElement;
    disabled?: boolean;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const navigate = useNavigate();
  const formStoreVertex = () =>
    graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const onSubmit = formSubmit(
    formStoreVertex,
    graph,
    setGraph,
    props.closePopUp ?? (() => {}),
    showErrorToast,
    showLoadingToast,
    showWarningToast,
  );
  const onCancel = formCancel(
    formStoreVertex,
    graph,
    setGraph,
    props.closePopUp ?? (() => {}),
    navigate,
  );
  return (
    <As
      as="div"
      css={`return \`._id {
      display: flex;
      justify-content: ${props.buttonAlign ? "end" : "start"};
    }\`;`}
    >
      <As
        as="button"
        css={[
          SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
          `return \`._id {
  margin-right: 7px;
}\`;`,
        ]}
        onClick={onCancel}
        type="button"
      >
        Cancel
      </As>
      <Show
        fallback={
          <As
            as="button"
            css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
            disabled={props.disabled}
            onClick={onSubmit}
            type="button"
          >
            Save
          </As>
        }
        when={props.customSubmitButton}
      >
        {props.customSubmitButton}
      </Show>
    </As>
  );
}
