import { createMemo, type JSX, splitProps } from "solid-js";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { getSelectedItemStyle } from "./treeUtils";
import type { CssType } from "~/components/form/type/CssType";

export interface TreeItemContainerProps {
  children: JSX.Element;
  class?: string;
  hasChildren: boolean;
  isDragOver?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  itemId?: string | number;
  css?: CssType;
  // Include standard HTMLDivElement attributes
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onDragEnter?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>;
  onDragLeave?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>;
  onDragOver?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>;
  onDragStart?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>;
  onDrop?: JSX.EventHandlerUnion<HTMLDivElement, DragEvent>;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onmouseleave?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  ref?: (element: HTMLDivElement) => void;
  draggable?: boolean | "true" | "false";
  tabIndex?: number;
}

export function TreeItemContainer(props: TreeItemContainerProps) {
  const [local, others] = splitProps(props, [
    "class",
    "hasChildren",
    "isDragOver",
    "isHovered",
    "isSelected",
    "itemId",
    "css",
  ]);

  // little dark shadow on top, little lite shadow on bottom
  const containerStyles = createMemo(
    () => `return \`._id {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    font-size: 14px;
    font-weight: ${local.hasChildren ? "bold" : "normal"};
    width: 100%;
    border-radius: ${local.hasChildren ? "5px" : "0 5px 5px 0"};
    ${local.isHovered ? `background-color: \${args.theme.var.color.background_light_150};` : ""}
    ${local.isSelected ? getSelectedItemStyle() : ""}
    ${!local.isDragOver && local.hasChildren ? "box-shadow: rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px;" : ""}
    padding: 2px 0;
    transition: all 0.15s ease-in-out;
  }\`;`,
  );

  return (
    <As
      as="div"
      css={[containerStyles(), ...ensureArray(props.css)]}
      data-item-id={local.itemId ? String(local.itemId) : undefined}
      tabIndex={local.isSelected ? 0 : -1}
      {...others}
    />
  );
}
