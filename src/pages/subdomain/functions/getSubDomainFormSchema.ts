import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { validateDatabaseName } from "~/lib/validation/validateDatabaseName";

import { PROPERTIES, SETTINGS_CONSTANTS } from "../../settings/constants";
import { addEditButtonSchema } from "./addEditButtonSchema";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define extended function argument type that includes modalState
interface SubDomainFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    modalState: ModalStateStore;
    [key: string]: unknown;
  };
}

export function getSubDomainFormSchema(onSuccess: () => void) {
  const { showErrorToast, showSuccessToast } = useToast();
  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter Project name");
      return false;
    }
    const databaseNameError = validateDatabaseName(formData.P.key);
    if (databaseNameError) {
      showErrorToast(databaseNameError);
      return false;
    }
    return true;
  };

  const handleSave = async (options: SubDomainFunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);
      const url = formData.id?.startsWith("-")
        ? API.subdomain.createUrl
        : API.subdomain.updateUrl;
      const payload: {
        key: string;
        domain: string;
        description: string;
        id?: string;
      } = {
        key: formData.P.key as string,
        domain: (formData.P.domain as string) || "",
        description: (formData.P.description as string) || "",
      };

      if (formData.id && !formData.id.startsWith("-")) {
        payload.id = formData.id;
      }

      const response = await postAPI(url, payload);

      if (response.error) {
        showErrorToast(response.error as string);
      } else {
        options.removeTxnIdAndCreateNew(options.txnId);
        options.ensureData();
        showSuccessToast(
          formData.id?.startsWith("-")
            ? "Project created successfully"
            : "Project updated successfully",
        );
        modalState[1]("showModal", false);
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", false);
    }
  };

  const formSchema = {
    as: "div",
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
                text: "Name",
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "key",
                placeholder: "Enter Project / SubDomain name",
                props: (options: SubDomainFunctionArgumentType) => ({
                  disabled:
                    options.data?.id && !options.data.id.startsWith("-"),
                }),
                validation: { required: true },
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Domain",
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "domain",
                placeholder: "Enter domain (Optional) eg: example.com",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: SETTINGS_CONSTANTS.LABEL_CSS,
                componentName: "Html",
                text: "Description",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                type: "textarea",
                key: "description",
                placeholder: "Enter description (Optional)",
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Add New Project",
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
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        componentName: "Html",
        props: (options: SubDomainFunctionArgumentType) => {
          const modalState = options.contextData.modalState;
          return {
            disabled: modalState[0]?.isLoading,
            onClick: () => handleSave(options),
            text: modalState[0]?.isLoading ? "Saving..." : "Save",
          };
        },
        type: "button",
      },
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        componentName: "Html",
        props: (options: SubDomainFunctionArgumentType) => {
          const modalState = options.contextData.modalState;
          return {
            onClick: () => {
              modalState[1]("showModal", false);
              options.revertTransactionUpToIndex(options.txnId, -1);
              options.ensureData();
            },
            text: "Cancel",
          };
        },
        type: "button",
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS,
    componentName: "Html",
  };

  const schema: FieldAttribute = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Project"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: SubDomainFunctionArgumentType) => {
              const modalState = options.contextData.modalState;
              return {
                hide: !modalState[0]?.showModal,
              };
            },
          },
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "dialog",
                    attributes: [
                      {
                        attributes: [
                          modalHeaderSchema,
                          formSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data?.id,
                        }),
                      },
                    ],
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    componentName: "Html",
                    open: true,
                    props: (options: SubDomainFunctionArgumentType) => {
                      const modalState = options.contextData.modalState;

                      return {
                        hide: !modalState[0]?.showModal,
                        style: {
                          "z-index": options.zIndex + 1,
                        },
                        beforeMount: () => {
                          // Create focus trap
                          createFocusTrap({
                            element: options.ref,
                            enabled: () => modalState[0]?.showModal,
                            observeChanges: true,
                            restoreFocus: true,
                          });
                        },
                      };
                    },
                  },
                ],
                componentName: "Html",
                as: "portal",
                props: (options: SubDomainFunctionArgumentType) => {
                  const modalState = options.contextData.modalState;
                  return {
                    hide: !modalState[0]?.showModal,
                  };
                },
              },
            ],
            componentName: "ZIndex",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Html",
    contextName: "modalState",

    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "SubDomain" } as IFormMetaData;
}
