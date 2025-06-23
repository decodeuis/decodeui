import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { validateEmail } from "~/lib/validation/validateEmail";

import { handleApiRequest } from "../../../lib/api/general/handleApiRequest";
import { SchemaRenderer } from "../../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";

// Define the type for saveState store
type SaveStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Extend FunctionArgumentType to include our contextData
interface CompanySettingsFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: SaveStateStore;
    [key: string]: unknown;
  };
}

// Validation functions
const validateRequired = (value: string) => {
  if (!value || value.trim() === "") {
    return "This field is required";
  }
  return undefined;
};

// Validation function for form data
const validateFormData = (data: Record<string, unknown>) => {
  const errors: Record<string, string> = {};

  // Company name is required
  const companyNameError = validateRequired(data.companyName as string);
  if (companyNameError) {
    errors.companyName = companyNameError;
  }

  // Email validation if provided
  if (data.contactEmail) {
    const emailError = validateEmail(data.contactEmail as string);
    if (emailError) {
      errors.contactEmail = emailError;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export function CompanySettings() {
  const { showErrorToast, showSuccessToast } = useToast();

  const loadSettingsData = async () => {
    return await getAPI(API.settings.company.getUrl);
  };

  const form: FieldAttribute = {
    as: "",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Company Name",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "companyName",
                placeholder: "Enter company name",
                validate: (value: string) => validateRequired(value),
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "companyName",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Address",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                type: "textarea",
                key: "address",
                placeholder: "Enter company address",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "address",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Contact Email",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "contactEmail",
                placeholder: "Enter contact email",
                type: "email",
                validate: (value: string) =>
                  value ? validateEmail(value) : undefined,
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "contactEmail",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Phone",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "phone",
                placeholder: "Enter phone number",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          getErrorSchema(
            "phone",
            `return \`._id {color: \${args.theme.var.color.error}; margin-top: -20px;}\`;`,
          ),
          {
            as: "div",
            attributes: [
              {
                attributes: [
                  {
                    as: "button",
                    css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                    componentName: "Html",
                    props: (options: CompanySettingsFunctionArgumentType) => ({
                      disabled: options.contextData.saveState[0]?.isLoading,
                      onClick: async () => {
                        // Validate form data
                        const settings = options.data;
                        const errors = validateFormData(
                          settings.P as Record<string, unknown>,
                        );

                        if (errors) {
                          // Show validation errors
                          for (const fieldKey in errors) {
                            options.setError(errors[fieldKey], fieldKey);
                          }
                          showErrorToast("Please fix the validation errors");
                          return;
                        }

                        options.clearAllErrors();

                        // Use the common handleApiRequest function
                        await handleApiRequest(
                          API.settings.company.updateUrl,
                          settings.P,
                          "Company details updated successfully",
                          (isLoading) =>
                            options.contextData.saveState[1](
                              "isLoading",
                              isLoading,
                            ),
                          showSuccessToast,
                          showErrorToast,
                        );
                      },
                      text: options.contextData.saveState[0]?.isLoading
                        ? "Saving..."
                        : "Save Changes",
                    }),
                  },
                ],
                componentName: "Data",
                name: "saveState",
                props: () => ({
                  data: createStore({
                    isLoading: false,
                  }),
                }),
              },
            ],
            css: `return \`._id {
  margin-top: 24px;
}\`;`,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [form], key: "CompanySettings" }}
      getFormData={loadSettingsData}
    />
  );
}
