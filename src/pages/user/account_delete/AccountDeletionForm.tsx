import { createStore, type SetStoreFunction } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";

type DeleteState = {
  errorMessage: string;
  isLoading: boolean;
  showConfirmDialog: boolean;
  successMessage: string;
};

// Define a type for function arguments with deleteState in contextData
interface DeleteStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    deleteState: [DeleteState, SetStoreFunction<DeleteState>];
    [key: string]: unknown;
  };
}

export function AccountDeletionForm() {
  const handleDeleteAccount = async (
    options: DeleteStateFunctionArgumentType,
  ) => {
    options.contextData.deleteState[1]("isLoading", true);
    options.contextData.deleteState[1]("errorMessage", "");
    options.contextData.deleteState[1]("successMessage", "");
    options.contextData.deleteState[1]("showConfirmDialog", false);

    try {
      const response = await postAPI(API.user.selfDeleteUrl, {});

      if (response.success) {
        options.contextData.deleteState[1](
          "successMessage",
          (response.message as string) ||
            "Account scheduled for deletion. It will be permanently removed after 48 hours.",
        );
        // Redirect to logout after successful deletion request
        setTimeout(() => {
          options.navigate(API.urls.user.logout);
        }, 3000);
      } else {
        options.contextData.deleteState[1](
          "errorMessage",
          (response.error as string) ||
            "Failed to schedule account for deletion. Please try again.",
        );
      }
    } catch (error) {
      options.contextData.deleteState[1](
        "errorMessage",
        "An unexpected error occurred. Please try again.",
      );
      console.error("Error scheduling account deletion:", error);
    } finally {
      options.contextData.deleteState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Confirm Account Deletion",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
    componentName: "Html",
  };
  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        componentName: "Html",
        props: (options: DeleteStateFunctionArgumentType) => ({
          onClick: () => {
            options.contextData.deleteState[1]("showConfirmDialog", false);
          },
          text: "Cancel",
        }),
        type: "button",
      },
      {
        as: "button",
        css: `return \`._id {
  background-color: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}\`;`,
        componentName: "Html",
        props: (options: DeleteStateFunctionArgumentType) => ({
          disabled: options.contextData.deleteState[0]?.isLoading,
          onClick: () => handleDeleteAccount(options),
          text: options.contextData.deleteState[0]?.isLoading
            ? "Deleting..."
            : "Yes, Delete My Account",
        }),
        type: "button",
      },
    ],
    css: `return \`._id {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}\`;`,
    componentName: "Html",
  };
  const deleteAccountSchema: FieldAttribute = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "h1",
            css: `return \`._id {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 4px;
  color: \${args.theme.var.color.error};
}\`;`,
            componentName: "Html",
            text: "Delete Your Account",
          },
          {
            as: "p",
            css: `return \`._id {
  margin-bottom: 4px;
  color: \${args.theme.var.color.error_light_200};
}\`;`,
            componentName: "Html",
            text: "Once you delete your account, all your data will be permanently removed after 48 hours. This action cannot be undone.",
          },
          {
            as: "p",
            css: `return \`._id {
  margin-bottom: 6px;
  color: \${args.theme.var.color.error_light_200};
}\`;`,
            componentName: "Html",
            text: "During the 48-hour period, you will not be able to log in to your account. If you change your mind, please contact our support team immediately.",
          },
        ],
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            componentName: "Html",
            props: (options: DeleteStateFunctionArgumentType) => ({
              text: options.contextData.deleteState[0]?.errorMessage,
            }),
          },
        ],
        css: `return \`._id {
  margin-bottom: 4px;
  padding: 12px;
  background-color: \${args.theme.var.color.error_light_100};
  border: 1px solid \${args.theme.var.color.error_light_150};
  color: \${args.theme.var.color.error_light_100_text};
  border-radius: 8px;
}\`;`,
        componentName: "Html",
        props: (options: DeleteStateFunctionArgumentType) => ({
          hide: !options.contextData.deleteState[0]?.errorMessage,
        }),
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            componentName: "Html",
            props: (options: DeleteStateFunctionArgumentType) => ({
              text: options.contextData.deleteState[0]?.successMessage,
            }),
          },
        ],
        css: `return \`._id {
  margin-bottom: 4px;
  padding: 12px;
  background-color: \${args.theme.var.color.primary};
  border: 1px solid \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  border-radius: 8px;
}\`;`,
        componentName: "Html",
        props: (options: DeleteStateFunctionArgumentType) => ({
          hide: !options.contextData.deleteState[0]?.successMessage,
        }),
      },
      {
        as: "div",
        attributes: [
          {
            as: "button",
            css: `return \`._id {
  background-color: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}\`;`,
            componentName: "Html",
            props: (options: DeleteStateFunctionArgumentType) => ({
              disabled: options.contextData.deleteState[0]?.isLoading,
              onClick: () => {
                options.contextData.deleteState[1]("showConfirmDialog", true);
              },
              text: "Delete Account",
            }),
            type: "button",
          },
        ],
        css: `return \`._id {
  display: flex;
  justify-content: flex-end;
}\`;`,
        componentName: "Html",
      },
      // Confirmation Dialog
      {
        as: "div",
        attributes: [
          {
            as: "div",
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      modalHeaderSchema,
                      {
                        as: "div",
                        attributes: [
                          {
                            as: "span",
                            css: `return \`._id {
  margin-bottom: 4px;
}\`;`,
                            componentName: "Html",
                            text: "Are you sure you want to delete your account? This action cannot be undone.",
                          },
                          {
                            as: "span",
                            css: `return \`._id {
  margin-bottom: 6px;
}\`;`,
                            componentName: "Html",
                            text: "Your account will be scheduled for deletion and permanently removed after 48 hours.",
                          },
                          modalFooterSchema,
                        ],
                        css: `return \`._id {
  padding: 24px;
}\`;`,
                        componentName: "Html",
                      },
                    ],
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    componentName: "Html",
                    open: true,
                    props: (options: DeleteStateFunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    }),
                  },
                ],
                componentName: "Html",
                as: "portal",
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Html",
        props: (options: DeleteStateFunctionArgumentType) => ({
          hide: !options.contextData.deleteState[0]?.showConfirmDialog,
        }),
      },
    ],
    css: `return \`._id {
  padding: 24px;
  border-radius: 8px;
  background-color: \${args.theme.var.color.background_light_100};
  border: 1px solid \${args.theme.var.color.background};  
}\`;`,
    componentName: "Html",
  };

  // Main form schema with state management
  const formSchema: FieldAttribute = {
    attributes: [deleteAccountSchema],
    componentName: "Html",
    contextName: "deleteState",

    props: (options: FunctionArgumentType) => ({
      data: createStore<DeleteState>({
        errorMessage: "",
        isLoading: false,
        showConfirmDialog: false,
        successMessage: "",
      }),
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{ attributes: [formSchema], key: "AccountDeletion" }}
    />
  );
}
