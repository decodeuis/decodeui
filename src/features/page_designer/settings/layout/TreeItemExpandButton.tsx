import { Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import type { Id } from "~/lib/graph/type/id";

export function TreeItemExpandButton(
  props: Readonly<{
    hasChildren: boolean;
    isCollapsed: boolean;
    metaVertexId: Id;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  return (
    <Show when={props.hasChildren}>
      <IconButton
        icon={props.isCollapsed ? "ph:caret-right" : "ph:caret-down"}
        css={`return \`._id {
          margin: 0 4px;
          transform: ${props.isCollapsed ? "rotate(0deg)" : "rotate(180deg)"};
          transition: transform 0.2s linear;
          background-color: transparent;
          border: none;
          color: currentColor;
        }\`;`}
        noCenter
        onClick={(e) => {
          e.stopPropagation();
          props.toggleExpand(props.metaVertexId);
        }}
        size="1em"
      />
    </Show>
  );
}
