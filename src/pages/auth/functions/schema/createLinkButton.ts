import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

/**
 * Creates a link button
 * @param text - Button text
 * @param onClick - Click handler
 * @param css - Additional CSS classes
 * @returns Link button schema
 */
export function createLinkButton(
  text: (options: FunctionArgumentType) => string,
  onClick: (options: FunctionArgumentType) => Promise<void> | void,
  cssString = `return \`._id {text-align:center; margin-top:16px;}\`;`,
) {
  return {
    as: "div",
    attributes: [
      {
        as: "a",
        css: `return \`._id {
  color: #3b82f6;
  cursor: pointer;
}\`;`,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: async () => {
            if (onClick) {
              await onClick(options);
            }
          },
          text: text(options),
        }),
      },
    ],
    css: cssString,
    componentName: "Html",
  };
}
