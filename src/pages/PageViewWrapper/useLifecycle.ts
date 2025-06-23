import { createEffect, on, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { makeEventListener } from "@solid-primitives/event-listener";
import { type BeforeLeaveEventArgs, useBeforeLeave } from "@solidjs/router";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import type { SetStoreFunction } from "solid-js/store";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageViewWrapperProps } from "~/pages/PageViewWrapper/types";

interface UseLifecycleOptions {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  formStore: () => Vertex<FormStoreObject>;
  setFormStore: (key: string, value: unknown) => void;
  metaTxnId: number;
}

export function useLifecycle(
  props: Readonly<PageViewWrapperProps>,
  options: UseLifecycleOptions,
) {
  let onConfirmExit: () => void;

  // Start loading data immediately
  onMount(() => {
    options.setFormStore("mounted", true);
  });

  createEffect(
    on(
      () => props.formId ?? "new",
      () => options.setFormStore("count", options.formStore().P.count + 1),
      { defer: true },
    ),
  );

  onCleanup(() => {
    revertTransaction(options.metaTxnId, options.graph, options.setGraph);
  });

  onCleanup(() => {
    // TODO: Remove all the meta
  });

  if (props.isDesignMode) {
    // Each open tab will be hide and have its own useBeforeLeave callback
    useBeforeLeave((e: BeforeLeaveEventArgs) => {
      if (props.dontConfirmExit) {
        // allow navigation
        return;
      }
      if (isDisabledTxn(options.formStore().P.txnId, options.graph)) {
        // allow navigation
        return;
      }

      // preventDefault to block immediately and prompt user async
      e.preventDefault();
      setTimeout(() => {
        options.setFormStore("discardPopup", true);
      }, 100);
      onConfirmExit = () => {
        // user wants to proceed anyway so retry with force=true
        e.retry(true);
      };
    });

    const beforeunload = (event: BeforeUnloadEvent) => {
      if (!isDisabledTxn(options.formStore().P.txnId, options.graph)) {
        event.preventDefault();
        event.returnValue = ""; // Chrome requires returnValue to be set
      }
    };
    if (!isServer) {
      makeEventListener(window, "beforeunload", beforeunload);
    }
  }

  return {
    onConfirmExit: () => onConfirmExit && onConfirmExit(),
  };
}
