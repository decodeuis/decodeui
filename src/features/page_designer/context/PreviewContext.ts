import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { InitialPermissions } from "~/features/page_attr_render/InitialPermissions";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export type PreviewStoreObject = ReturnType<typeof getInitialPreviewStore>;

type PreviewStore = ReturnType<typeof createStore<PreviewStoreObject>>;

export function getInitialPreviewStore() {
  return {
    ...InitialPermissions,
    context: undefined as any | undefined,
    id: undefined as Id | undefined,
    isDesignMode: false as boolean | undefined,
    isViewOnly: false as boolean | null | undefined,
    previewData: undefined as undefined | Vertex,
    previewMeta: undefined as undefined | Vertex,
  };
}

export const PreviewContext = createContext<PreviewStore>(
  createStore(getInitialPreviewStore()),
);

export function usePreviewContext() {
  return useContext(PreviewContext);
}
