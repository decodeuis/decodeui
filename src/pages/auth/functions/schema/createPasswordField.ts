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
interface PasswordFieldFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

/**
 * Creates a password field with visibility toggle
 * @param key - Field key
 * @param label - Field label
 * @param showPassword - Password visibility state
 * @param toggleVisibility - Function to toggle visibility
 * @param onEnterKeyHandler - Handler for Enter key press
 * @param setRef - Function to set input ref
 * @returns Password field schema
 */
export function createPasswordField(
  key: string,
  label: string,
  showPassword: Record<string, boolean>,
  toggleVisibility: (field: string) => void,
  onEnterKeyHandler?: (options: PasswordFieldFunctionArgumentType) => void,
  setRef?: (ref: HTMLInputElement) => void,
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
          props: (options: PasswordFieldFunctionArgumentType) => ({
            onInput: (e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                options.updateValue(e.target.value);
              }
            },
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
            type: showPassword[key] ? "text" : "password",
          }),
          validation: { required: true },
        },
        {
          as: "div",
          attributes: [
            {
              componentName: "Html",
              as: "icon",
              props: () => ({
                icon: showPassword[key] ? "ph:eye" : "ph:eye-slash",
                onClick: () => toggleVisibility(key),
              }),
            },
          ],
          css: `return \`._id {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}\`;`,
          componentName: "Html",
        },
      ],
      css: `return \`._id {
  position: relative;
}\`;`,
      componentName: "Html",
    },
    getErrorSchema(key),
  ];
}
