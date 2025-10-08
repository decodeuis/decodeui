import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define a type for function arguments with modalState in contextData
interface ActivityLogFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    modalState: ModalStateStore;
    [key: string]: unknown;
  };
}

// Define type for payload
interface ActivityLogPayload {
  action: string;
  description: string | undefined;
  entityId: string;
  entityType: string;
  user: string | undefined;
  id?: string;
}

export function getActivityLogFormSchema(onSuccess: () => void) {
  const { showErrorToast, showSuccessToast } = useToast();
  const validateForm = (formData: Vertex) => {
    if (!formData.P.action?.trim()) {
      showErrorToast("Please enter action");
      return false;
    }
    if (!formData.P.entityType?.trim()) {
      showErrorToast("Please enter entity type");
      return false;
    }
    if (!formData.P.entityId?.trim()) {
      showErrorToast("Please enter entity ID");
      return false;
    }
    return true;
  };

  const handleSave = async (options: ActivityLogFunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);
      const url = formData.id?.startsWith("-")
        ? // @ts-expect-error ignore error
          API.settings.activity.createUrl
        : // @ts-expect-error ignore error
          API.settings.activity.updateUrl;
      const payload: ActivityLogPayload = {
        action: formData.P.action as string,
        description: formData.P.description as string | undefined,
        entityId: formData.P.entityId as string,
        entityType: formData.P.entityType as string,
        user: formData.P.user as string | undefined,
      };

      if (formData.id && !formData.id.startsWith("-")) {
        payload.id = formData.id;
      }

      const response = await postAPI(url, payload);

      if (response.error) {
        showErrorToast(response.error as string);
      } else {
        // options.removeTxnIdAndCreateNew(options.txnId);
        // as we are creating new transaction, we need to revert to previous state
        options.revertTransactionUpToIndex(options.txnId, -1);
        options.ensureData();
        showSuccessToast(
          formData.id?.startsWith("-")
            ? "Activity log created successfully"
            : "Activity log updated successfully",
        );
        const modalState = options.contextData.modalState;
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
                text: "Action",
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "action",
                placeholder: "Enter action",
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
                text: "Entity Type",
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "entityType",
                placeholder: "Enter entity type",
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
                text: "Entity ID",
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "entityId",
                placeholder: "Enter entity ID",
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
                text: "User",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "user",
                placeholder: "Enter user",
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
                key: "description",
                placeholder: "Enter description",
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
        text: "Add New Activity Log",
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
        props: (options: ActivityLogFunctionArgumentType) => ({
          disabled: options.contextData.modalState[0]?.isLoading,
          onClick: () => handleSave(options),
          text: options.contextData.modalState[0]?.isLoading
            ? "Saving..."
            : "Save",
        }),
        type: "button",
      },
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        componentName: "Html",
        props: (options: ActivityLogFunctionArgumentType) => ({
          onClick: () => {
            const modalState = options.contextData.modalState;
            modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
          },
          text: "Cancel",
        }),
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
          addEditButtonSchema("ActivityLog"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: ActivityLogFunctionArgumentType) => ({
              hide: !options.contextData.modalState[0]?.showModal,
            }),
          },
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
                props: (options: ActivityLogFunctionArgumentType) => ({
                  hide: !options.contextData.modalState[0]?.showModal,
                  style: {
                    "z-index": options.zIndex + 1,
                  },
                }),
              },
            ],
            componentName: "Html",
            as: "portal",
            props: (options: ActivityLogFunctionArgumentType) => ({
              hide: !options.contextData.modalState[0]?.showModal,
            }),
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

  return { attributes: [schema], key: "ActivityLog" } as IFormMetaData;
}
