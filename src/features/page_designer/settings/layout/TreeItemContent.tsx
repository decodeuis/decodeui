import { Icon } from "@iconify-icon/solid";
import { type Accessor, createMemo } from "solid-js";

import { nameExpr } from "~/features/page_designer/settings/functions/nameExpr";
import { iconMap } from "~/lib/ui/iconMap";

import { getComponentName } from "../../functions/component/getComponentLabel";
import { getChildrenAttrs } from "../../functions/layout/getChildrenAttrs";
import { TreeItemExpandButton } from "./TreeItemExpandButton";
import { As } from "~/components/As";
import { getTreeItemColor } from "./treeUtils";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
    parentIndex?: number;
    isSelected?: boolean;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );

  const componentVertex = createMemo(() => {
    return props.metaVertex.P.componentName
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          props.metaVertex.P.componentName,
        )
      : undefined;
  });
  const componentName = () =>
    getComponentName(componentVertex(), props.metaVertex);

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  gap: 4px;
  align-items: center;
  ${children().length ? "" : "padding-left: 24px;"}
}\`;`}
      // bl:1px|dashed|black
    >
      <TreeItemExpandButton
        hasChildren={!!children().length}
        isCollapsed={props.collapsedKeys().includes(props.metaVertex.id)}
        metaVertexId={props.metaVertex.id}
        toggleExpand={props.toggleExpand}
      />
      <Icon
        height={17}
        icon={
          props.metaVertex.P.icon ||
          componentVertex()?.P.icon ||
          iconMap[componentVertex()?.L[0] as keyof typeof iconMap] ||
          iconMap[componentName() as keyof typeof iconMap] ||
          "ph:circle"
        }
        style={{
          color: props.isSelected
            ? "currentColor"
            : getTreeItemColor(props.parentIndex),
        }}
        noobserver
        width={17}
      />
      <As
        as="span"
        css={`return \`._id {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }\`;`}
      >
        {nameExpr(props.metaVertex, componentName(), graph)}
      </As>
    </As>
  );
}
