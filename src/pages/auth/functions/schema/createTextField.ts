import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import type { createStore } from "solid-js/store";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface TextFieldFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

// Define a more specific type for validation options
interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  regex?: {
    enabled: boolean;
    message: string;
    value: string;
  };
  validate?: (value: string) => string | undefined;
  [key: string]: unknown;
}

/**
 * Creates a text input field
 * @param key - Field key
 * @param label - Field label
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @param validation - Validation options
 * @returns Text input field schema
 */
export function createTextField(
  key: string,
  label: string,
  onEnterKeyHandler?: (options: TextFieldFunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
  validation: ValidationOptions = { required: true },
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
          key,
          name: key,
          props: (options: TextFieldFunctionArgumentType) => ({
            onKeyDown: async (e: KeyboardEvent) => {
              if (e.key === "Enter") {
                if (e.target instanceof HTMLInputElement) {
                  options.updateValue(e.target.value);
                }

                if (options.contextData.submitState[0]?.isLoading) {
                  return;
                }

                if (onEnterKeyHandler) {
                  onEnterKeyHandler(options);
                }
              }
            },
            onMount: (ref: HTMLInputElement) => {
              if (setRef) {
                setRef(ref);
              }
            },
            ref: setRef,
          }),
          validation,
        },
      ],
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}
