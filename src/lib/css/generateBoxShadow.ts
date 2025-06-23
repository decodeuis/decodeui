export interface ShadowAttributes {
  "blur-radius"?: string;
  color?: string;
  inset?: string;
  "offset-x": string;
  "offset-y": string;
  spread: string;
}

export function generateBoxShadow(
  shadows: ShadowAttributes[],
  isView?: boolean,
): string {
  if (!shadows) {
    return "";
  }
  const separator = isView ? " " : " ";
  const separator2 = isView ? ", " : ", ";

  return shadows
    .filter((shadow) => shadow)
    .map((shadow) => {
      const {
        "blur-radius": blurRadius = "0px",
        color = "",
        inset = "",
        "offset-x": xOffset = "0px",
        "offset-y": yOffset = "0px",
        spread = "0px",
      } = shadow;

      const colorPart = color ? `${separator}${color}` : "";
      const insetPart = inset ? `${separator}${inset}` : "";

      return `${xOffset}${separator}${yOffset}${separator}${blurRadius}${separator}${spread}${colorPart}${insetPart}`;
    })
    .join(separator2);
}
