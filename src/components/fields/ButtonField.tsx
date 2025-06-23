import type { JSX } from "solid-js";
import { getOwner, runWithOwner, Show, splitProps } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Dynamic } from "solid-js/web";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { resetTransaction } from "~/lib/graph/transaction/revert/resetTransaction";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { createLongPress } from "~/lib/hooks/createLongPress";

import {
  type FormStoreObject,
  useFormContext,
} from "../form/context/FormContext";
import { useToast } from "../styled/modal/Toast";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { isAnyFieldInvalid } from "~/features/page_designer/functions/form/isAnyFieldInvalid";

interface ButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  as?: string;
  buttonType: "cancel" | "reset" | "submit";
  href?: string;
  longPressDuration?: number;
  onLongPress?: (event: Event) => void;
  text?: string;
}

// Deprecated - Just keep for reference of submit and reset button logic.
export function ButtonField(props: Readonly<ButtonProps>) {
  const owner = getOwner();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const navigate = useNavigate();
  const [previewStore] = usePreviewContext();

  const [local, others] = splitProps(props, [
    "as",
    "ref",
    "children",
    "text",
    "onClick",
    "onLongPress",
    "longPressDuration",
    "onMouseDown",
    "onMouseUp",
    "onMouseLeave",
    "onTouchStart",
    "onTouchEnd",
    "onTouchCancel",
    "buttonType",
  ]);

  const onSubmit = async () => {
    if (
      isAnyFieldInvalid(
        graph,
        setGraph,
        meta()!,
        graph.vertexes[formVertex()!.P.formDataId!],
      )
    ) {
      return;
    }
    const data = commitTxn(formVertex()!.P.txnId, graph);
    if (!data) {
      return;
    }
    await showLoadingToast({
      loadMessage: "Submitting Data...",
      onSuccess: () => {
        // setTimeout(() => navigate(-1), 0);
      },
      promise: submitDataCall(data, graph, setGraph, formVertex()!.P.txnId),
      successMessage: "Data submitted successfully",
    });
  };

  const onCancel = () => {
    revertTransaction(formVertex()!.P.txnId, graph, setGraph);
    setTimeout(() => navigate(-1));
  };

  const onReset = () => {
    resetTransaction(formVertex()!.P.txnId, graph, setGraph);
  };
  const onClick = () => {
    runWithOwner(owner, () => {
      if (previewStore.isDesignMode) {
        return;
      }
      if (local.buttonType === "submit") {
        if (previewStore.isViewOnly) {
          return;
        }
        onSubmit();
      } else if (local.buttonType === "cancel") {
        onCancel();
      } else if (local.buttonType === "reset") {
        onReset();
      } else if (local.onClick) {
        local.onClick();
      }
    });
  };

  const { handlePressEnd, handlePressStart } = createLongPress(local);

  return (
    // <Show when={!(previewStore.isViewOnly && local.type === "submit")}>
    <Show
      fallback={
        <Dynamic
          component={local.as ?? (others.href ? "a" : "button")}
          tabIndex={props.disabled ? -1 : undefined}
          {...others}
          onClick={onClick}
          onMouseDown={local.onMouseDown}
          onMouseLeave={local.onMouseLeave}
          onMouseUp={local.onMouseUp}
          onTouchCancel={local.onTouchCancel}
          onTouchEnd={local.onTouchEnd}
          onTouchStart={local.onTouchStart}
        >
          {local.text}
          {local.children}
        </Dynamic>
      }
      when={props.onLongPress}
    >
      <Dynamic
        component={local.as ?? (others.href ? "a" : "button")}
        tabIndex={props.disabled ? -1 : undefined}
        {...others}
        onClick={onClick}
        // setting event handlers here like {...getEventHandlers()} re-renders the childrens! not sure why that behaves that way, used <Show> to not set dynamic event handlers here
        // {...getEventHandlers()}
        onMouseDown={handlePressStart}
        onMouseLeave={handlePressEnd}
        onMouseUp={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onTouchEnd={handlePressEnd}
        onTouchStart={handlePressStart}
      >
        {local.text}
        {local.children}
      </Dynamic>
    </Show>
    // </Show>
  );
}
