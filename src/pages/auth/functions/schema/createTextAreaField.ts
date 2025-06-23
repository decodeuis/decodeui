import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";

/**
 * Creates a text area field
 * @param key - Field key
 * @param label - Field label
 * @param rows - Number of rows
 * @param validation - Validation options
 * @returns Text area field schema
 */
export function createTextAreaField(
  key: string,
  label: string,
  rows = 6,
  validation: Record<string, any> = { required: true },
) {
  return [
    {
      as: "div",
      css: [SETTINGS_CONSTANTS.LABEL_CSS, `return \`._id {margin-top:5px;}\`;`],
      componentName: "Html",
      text: label,
    },
    {
      as: "div",
      attributes: [
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "SystemTextInput",
          type: "textarea",
          key,
          props: (options: FunctionArgumentType) => ({
            onChange: options.onChange,
            rows,
            value: options.value ?? "",
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}
