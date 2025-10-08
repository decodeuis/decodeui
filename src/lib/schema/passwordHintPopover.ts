import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import {
  PASSWORD_CONDITIONS,
  validatePasswordConditions,
} from "../validation/validatePassword";
import { popoverWrapperSchema } from "./popoverWrapperSchema";

// Type for password condition
interface PasswordCondition {
  isValid: boolean;
  message: string;
}

// Define types for the state stores
type ValidationStateStore = ReturnType<
  typeof createStore<{
    conditions: PasswordCondition[];
    isValid: boolean;
  }>
>;

type HelpIconStateStore = ReturnType<
  typeof createStore<{
    hasContent: boolean;
    isValid: boolean;
  }>
>;

// Define interfaces for different function argument types
interface ValidationStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    validationState: ValidationStateStore;
    helpIconState?: HelpIconStateStore;
    [key: string]: unknown;
  };
}

interface HelpIconStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    helpIconState: HelpIconStateStore;
    [key: string]: unknown;
  };
}

/**
 * Creates a popover content component that dynamically shows password validation status
 * @param passwordFieldKey The key of the password field to validate
 * @returns A field attribute for the popover content
 */
export function createPasswordHintPopoverContent(
  passwordFieldKey: string,
): FieldAttribute {
  return {
    as: "div",
    attributes: [
      {
        as: "h3",
        css: `return \`._id {
  font-size: 16px;
  color: \${args.theme.var.color.primary};
  margin: 0px;
  margin-bottom: 8px;
}\`;`,
        componentName: "Html",
        text: "Password Requirements",
      },
      {
        as: "ul",
        attributes: PASSWORD_CONDITIONS.map((condition, index) => ({
          as: "li",
          attributes: [
            {
              componentName: "Html",
              as: "icon",
              css: (options: ValidationStateFunctionArgumentType) => {
                const validationState = options.contextData.validationState;
                const isValid =
                  validationState[0]?.conditions?.[index]?.isValid;
                const fieldValue = options.data?.P?.[passwordFieldKey];
                const iconColor = fieldValue
                  ? isValid
                    ? "success"
                    : "error"
                  : "grey";
                return `return \`._id {
  color: \${args.theme.var.color.${iconColor}};
}\`;`;
              },
              props: (options: ValidationStateFunctionArgumentType) => {
                const validationState = options.contextData.validationState;
                const isValid =
                  validationState[0]?.conditions?.[index]?.isValid;
                const fieldValue = options.data?.P?.[passwordFieldKey];
                const iconName = fieldValue
                  ? isValid
                    ? "ph:check-circle-fill"
                    : "ph:x-circle-fill"
                  : "ph:circle";

                return {
                  icon: iconName,
                };
              },
            },
            {
              as: "span",
              componentName: "Html",
              css: (options: ValidationStateFunctionArgumentType) => {
                const validationState = options.contextData.validationState;
                const isValid =
                  validationState[0]?.conditions?.[index]?.isValid;
                const fieldValue = options.data?.P?.[passwordFieldKey];
                const textColor = fieldValue
                  ? isValid
                    ? "success"
                    : "text_dark_400"
                  : "text_dark_400";

                return `return \`._id {
  color: \${args.theme.var.color.${textColor}};
}\`;`;
              },
              props: () => {
                return {
                  text: condition.message,
                };
              },
            },
          ],
          css: `return \`._id {
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}\`;`,
          componentName: "Html",
        })),
        css: `return \`._id {
  margin: 0px;
  padding-left: 16px;
  list-style: none;
}\`;`,
        componentName: "Html",
        props: (options: ValidationStateFunctionArgumentType) => {
          createEffect(() => {
            const password = options.data?.P?.[passwordFieldKey] || "";
            const conditions = validatePasswordConditions(password);
            const isValid = conditions.every((condition) => condition.isValid);
            const hasContent = password.length > 0;

            // Update validation state
            options.contextData.validationState[1]("conditions", conditions);
            options.contextData.validationState[1]("isValid", isValid);

            // Update help icon state
            if (options.contextData.helpIconState) {
              options.contextData.helpIconState[1]("isValid", isValid);
              options.contextData.helpIconState[1]("hasContent", hasContent);
            }
          });

          return {};
        },
      },
    ],
    css: `return \`._id {
  padding: 12px;
  background-color: \${args.theme.var.color.background};
  border-radius: 4px;
  max-width: 300px;
}\`;`,
    componentName: "Html",
  };
}

/**
 * Creates an action element with help icon for password field labels
 * @param label The label text for the password field
 * @returns A field attribute for the label with help icon
 */
export function createPasswordLabelWithHint(label: string): FieldAttribute {
  return {
    as: "div",
    attributes: [
      {
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: label,
          },
          {
            componentName: "Html",
            as: "icon",
            css: (options: HelpIconStateFunctionArgumentType) => {
              const helpIconState = options.contextData.helpIconState;
              const iconColor = helpIconState[0]?.isValid
                ? "success"
                : helpIconState[0]?.hasContent
                  ? "warning"
                  : "grey";
              return `return \`._id {
  color: \${args.theme.var.color.${iconColor}};
}\`;`;
            },
            props: (options: HelpIconStateFunctionArgumentType) => {
              const helpIconState = options.contextData.helpIconState;
              const iconName = helpIconState[0]?.isValid
                ? "ph:check-circle"
                : helpIconState[0]?.hasContent
                  ? "ph:warning-circle"
                  : "ph:question-circle";

              return {
                icon: iconName,
              };
            },
          },
        ],
        css: `return \`._id {
  display: flex;
  gap: 4px;
  align-items: center;
}\`;`,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    contextName: "helpIconState",

    props: () => ({
      data: createStore<{
        hasContent: boolean;
        isValid: boolean;
      }>({
        hasContent: false,
        isValid: false,
      }),
    }),
  };
}

/**
 * Wraps a password label with a popover that shows password validation hints
 * @param label The label text for the password field
 * @param passwordFieldKey The key of the password field to validate
 * @returns A field attribute with the label wrapped in a popover
 */
export function getPasswordLabelWithHintSchema(
  label: string,
  passwordFieldKey: string,
): FieldAttribute {
  const actionElement = createPasswordLabelWithHint(label);
  const popoverContent = createPasswordHintPopoverContent(passwordFieldKey);

  return {
    as: "div",
    attributes: [
      {
        attributes: [popoverWrapperSchema(actionElement, popoverContent)],
        componentName: "Html",
        contextName: "validationState",

        props: () => ({
          data: createStore<{
            conditions: PasswordCondition[];
            isValid: boolean;
          }>({
            conditions: PASSWORD_CONDITIONS.map((condition) => ({
              isValid: false,
              message: condition.message,
            })),
            isValid: false,
          }),
        }),
      },
    ],
    componentName: "Html",
  };
}
