import type { createStore } from "solid-js/store";

import { createContext } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export const GraphContext =
  createContext<ReturnType<typeof createStore<GraphInterface>>>();
