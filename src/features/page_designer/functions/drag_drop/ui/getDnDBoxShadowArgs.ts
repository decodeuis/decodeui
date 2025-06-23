export function getDnDBoxShadowArgs(
  dragPosition: null | string,
  color: string,
  inset = "inset",
) {
  const boxShadowProps = {
    inset: inset,
    "offset-x": "0",
    // eslint-disable-next-line perfectionist/sort-objects
    blur: "0",
    "offset-y": "0",
    // eslint-disable-next-line perfectionist/sort-objects
    color: color,
    spread: "0",
  };

  switch (dragPosition) {
    case "after": {
      boxShadowProps["offset-y"] = "-8px";
      boxShadowProps.spread = "-6px";
      break;
    }
    case "before": {
      boxShadowProps["offset-y"] = "8px";
      boxShadowProps.spread = "-6px";
      break;
    }
    case "center":
      boxShadowProps.spread = "2px";
      break;
    case "left": {
      boxShadowProps["offset-x"] = "8px";
      boxShadowProps.spread = "-6px";
      break;
    }
    case "right": {
      boxShadowProps["offset-x"] = "-8px";
      boxShadowProps.spread = "-6px";
      break;
    }
    default: {
      boxShadowProps.color = "gray-30";
      boxShadowProps.spread = "2px";
    }
  }

  return boxShadowProps;
}
