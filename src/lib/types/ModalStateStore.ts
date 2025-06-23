import type { createStore } from "solid-js/store";

export type ModalStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
    showModal: boolean;
  }>
>;
