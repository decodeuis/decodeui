// never use object as context, It's modified as Proxy letter, and then after it become proxy, it cant change and it keeps old data.

import { createContext, useContext } from "solid-js";

// use Record<string | symbol, any> instead
export const DataContext = createContext<Record<string | symbol, any>>();

export function useDataContext() {
  return useContext(DataContext);
}
