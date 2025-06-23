import { IconButton } from "~/components/styled/IconButton";
import { TreeItemExpandButton } from "~/features/page_designer/settings/layout/TreeItemExpandButton";

import { useFileManagerStore } from "../FileManagerContext";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export function FileManagerTreeItemContent(
  props: Readonly<{
    hasChildren: boolean;
    item: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const handleDoubleClick = () => {
    setFileManagerStore("selectedItem", props.item);
  };
  return (
    <As
      as="div"
      css={[
        `return \`._id {
          align-items: center;
          cursor: pointer;
          display: flex;
          flex: 1;
        }\`;`,
        props.hasChildren
          ? ""
          : `return \`._id {
              border-left: 1px dashed black;
              padding-left: 10px;
            }\`;`,
      ]}
      onClick={handleDoubleClick}
    >
      <TreeItemExpandButton
        hasChildren={props.hasChildren}
        isCollapsed={!fileManagerStore.expandedKeys.includes(props.item.id)}
        metaVertexId={props.item.id}
        toggleExpand={props.toggleExpand}
      />
      <IconButton
        css={`return \`._id {
  cursor: pointer;
  margin-right: 5px;
  color: gray;
  background-color: transparent;
  border: none;
  padding: 0;
  &:hover {
    color: \${args.theme.var.color.gray_light_110};
  }
}\`;`}
        icon={
          props.item.L[0] === "Folder"
            ? "ic:round-folder"
            : "ic:round-insert-drive-file"
        }
        size={16}
      />
      &nbsp;&nbsp;
      <span>{props.item.P.key || "no key"}</span>
    </As>
  );
}
