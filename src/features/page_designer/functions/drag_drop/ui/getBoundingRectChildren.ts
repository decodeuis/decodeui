/* eslint-disable perfectionist/sort-objects */
export function getBoundingRectChildren(node: HTMLElement): DOMRect {
  // Get bounding rectangles of the direct children elements, assume that the will be always children, and it not gives maximum call stack error
  const elementDirectChildrens = Array.from(node.children);
  const rectangles = elementDirectChildrens
    .filter((element) => element)
    .map((element) => element.getBoundingClientRect());

  // If there are no child rectangles, use the node's bounding rectangle
  if (rectangles.length === 0) {
    // @ts-expect-error ignore
    if (node.getBoundingClientRectOriginal) {
      // @ts-expect-error ignore
      return node.getBoundingClientRectOriginal();
    }
    return node.getBoundingClientRect();
  }
  const getMaxProperty = (property: keyof DOMRect) =>
    Math.max(...rectangles.map((rect) => rect[property] as number));
  const getMinProperty = (property: keyof DOMRect) =>
    Math.min(...rectangles.map((rect) => rect[property] as number));

  return {
    top: getMinProperty("top"),
    right: getMaxProperty("right"),
    bottom: getMaxProperty("bottom"),
    left: getMinProperty("left"),
    width: getMaxProperty("right") - getMinProperty("left"),
    height: getMaxProperty("bottom") - getMinProperty("top"),
    x: getMinProperty("left"),
    y: getMinProperty("top"),
    toJSON: () => ({}),
  } as DOMRect;
}
