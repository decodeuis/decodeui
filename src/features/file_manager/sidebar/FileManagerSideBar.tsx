import { For } from "solid-js";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerTreeItem } from "./FileManagerTreeItem";

export function Sidebar() {
  const [fileManagerStore] = useFileManagerStore();
  return (
    <div>
      <For each={fileManagerStore.root}>
        {(root) => <FileManagerTreeItem item={root} />}
      </For>
    </div>
  );
}
