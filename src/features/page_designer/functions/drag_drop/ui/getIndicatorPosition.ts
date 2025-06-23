import { getBoundingRectChildren } from "./getBoundingRectChildren";

export function getIndicatorPosition(e: MouseEvent, node: HTMLElement) {
  // @ts-expect-error ignore
  const bounds = node.useCurrentPosition
    ? node.getBoundingClientRect()
    : getBoundingRectChildren(node);

  // Calculate the offset and dimensions
  const offsetY = e.clientY - bounds.top;
  const offsetX = e.clientX - bounds.left;
  const height = bounds.bottom - bounds.top;
  const width = bounds.right - bounds.left;

  // Determine the dragPosition based on offsets
  // @ts-expect-error ignore
  if (node.useCurrentPosition) {
    if (offsetY < 4) {
      return "before";
    }
    if (offsetY > height - 4) {
      return "after";
    }
    if (offsetX < 20) {
      return "left";
    }
    if (offsetX > width - 20) {
      return "right";
    }
  } else {
    if (offsetY < height * 0.25) {
      return "before";
    }
    if (offsetY > height * 0.75) {
      return "after";
    }
    if (offsetX < width * 0.25) {
      return "left";
    }
    if (offsetX > width * 0.75) {
      return "right";
    }
  }
  return "center";
}
