import { STYLES } from "~/pages/settings/constants";

/**
 * Creates a submit button
 * @param text - Button text
 * @param isLoading - Loading state
 * @param onClick - Click handler
 * @returns Submit button schema
 */
export function createSubmitButton(
  text: string,
  isLoading: boolean,
  onClick: () => void,
) {
  return {
    as: "button",
    attributes: [
      {
        as: "span",
        componentName: "Html",
        text,
      },
    ],
    css: [STYLES.button2Css, `return \`._id {width:100%;}\`;`],
    componentName: "Html",
    props: () => ({
      disabled: isLoading,
      onClick,
      type: "submit",
    }),
  };
}
