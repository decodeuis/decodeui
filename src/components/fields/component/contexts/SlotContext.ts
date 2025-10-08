import { createContext } from "solid-js";

export interface SlotContextType {
  (props: { slot: string; class?: string }): any;
}

export const SlotContext = createContext<SlotContextType[]>([]);
