import { Show } from "solid-js";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerMainArea } from "./FileManagerMainArea";

export function FileManagerMainContent() {
  const [fileManagerStore] = useFileManagerStore();
  return (
    <Show keyed when={fileManagerStore.selectedItem?.id}>
      <FileManagerMainArea item={fileManagerStore.selectedItem!} />
    </Show>
  );
}
