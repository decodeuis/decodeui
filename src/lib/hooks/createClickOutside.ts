import type { SetStoreFunction, Store } from "solid-js/store";

import { makeEventListener } from "@solid-primitives/event-listener";

import { getGlobalStore } from "../graph/get/sync/store/getGlobalStore";
import { createActiveClickOutside } from "./createActiveClickOutside";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function createClickOutside(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  callback: (event: MouseEvent) => void,
) {
  const activeClickOutside = createActiveClickOutside(graph, setGraph);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      activeClickOutside !==
      getGlobalStore(graph).P.activeClickOutside[
        getGlobalStore(graph).P.activeClickOutside.length - 1
      ]
    ) {
      return;
    }
    callback(event);
  };
  makeEventListener(window, "mousedown", handleClickOutside);
  return activeClickOutside;
}
