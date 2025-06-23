import type { createStore } from "solid-js/store";

import { createContext, type JSX, useContext } from "solid-js";

import type { FunctionArgumentType } from "../../../components/form/type/FieldSchemaType";

export type PageRenderObject = ReturnType<typeof getInitialPageRenderStore>;

export type PageRenderStore = ReturnType<typeof createStore<PageRenderObject>>;

export function getInitialPageRenderStore() {
  return {
    // ...InitialPermissions,
    context: {} as FunctionArgumentType,
  };
}

export const PageRenderContext = createContext<PageRenderStore[]>();

export function usePageRenderContext() {
  // this can be undefined too
  return useContext(PageRenderContext) || [];
}

export const PageRenderContextProvider = (props: {
  children: JSX.Element;
  store: PageRenderStore;
}) => {
  const parentItems = usePageRenderContext();

  return (
    <PageRenderContext.Provider value={[...parentItems, props.store]}>
      {props.children}
    </PageRenderContext.Provider>
  );
};
