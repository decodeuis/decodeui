import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { useToast } from "~/components/styled/modal/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { useFileManagerStore } from "../FileManagerContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";

const editFormSchema = {
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
              key: "fileName",
              placeholder: "Enter name",
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
              text: "Description",
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "SystemTextInput",
              type: "textarea",
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
} as FieldAttribute;

export const getEditFileOrFolderSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();
  const [fileManagerStore] = useFileManagerStore();

  const validateForm = (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.fileName?.trim()) {
      showErrorToast("Please enter name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: FunctionArgumentType) => {
    if (!validateForm(options)) {
      return;
    }
    const formData = options.data;

    try {
      const modalState = options.contextData.modalState as ModalStateStore;
      modalState[1]("isLoading", true);

      //   const currentItem = fileManagerStore.selectedItem;
      //   if (!currentItem) {
      //     showErrorToast("No item selected");
      //     return;
      //   }

      const newFormTxnId = generateNewTxnId(options.graph, options.setGraph);

      // Update the vertex properties
      mergeVertexProperties(
        newFormTxnId,
        formData.id,
        options.graph,
        options.setGraph,
        {
          description: formData.P.description,
          fileName: formData.P.fileName,
        },
      );

      const commitData = commitTxn(newFormTxnId, options.graph);

      if (!commitData) {
        showErrorToast("Failed to commit transaction");
        return;
      }

      const isSuccess = await submitDataCall(
        { ...commitData },
        options.graph,
        options.setGraph,
        newFormTxnId,
      );

      if (isSuccess) {
        // options.removeTxnIdAndCreateNew(options.txnId);
        // as we are creating new transaction, we need to revert to previous state
        options.revertTransactionUpToIndex(options.txnId, -1);
        options.ensureData;
        showSuccessToast("Item updated successfully");
        const modalState = options.contextData.modalState as ModalStateStore;
        modalState[1]("showModal", false);
        fileManagerStore.gridStore?.[0].fetchTableData();
        onSuccess();
      } else {
        showErrorToast("Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      showErrorToast("Failed to update item");
    } finally {
      const modalState = options.contextData.modalState as ModalStateStore;
      modalState[1]("isLoading", false);
    }
  };

  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Edit Item",
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
        props: (options: FunctionArgumentType) => ({
          disabled: (options.contextData.modalState as ModalStateStore)[0]
            ?.isLoading,
          onClick: () => handleSave(options),
          text: (options.contextData.modalState as ModalStateStore)[0]
            ?.isLoading
            ? "Saving..."
            : "Save",
        }),
        type: "button",
      },
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            const modalState = options.contextData
              .modalState as ModalStateStore;
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

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Edit"),
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "div",
                    attributes: [],
                    css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
                    componentName: "Html",
                    props: (options: FunctionArgumentType) => ({
                      hide: !(
                        options.contextData.modalState as ModalStateStore
                      )[0]?.showModal,
                      style: {
                        "z-index": options.zIndex,
                      },
                    }),
                  },
                  {
                    as: "dialog",
                    attributes: [
                      modalHeaderSchema,
                      editFormSchema,
                      modalFooterSchema,
                    ],
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                    }),
                  },
                ],
                componentName: "Html",
                as: "portal",
                props: (options: FunctionArgumentType) => ({
                  hide: !(options.contextData.modalState as ModalStateStore)[0]
                    ?.showModal,
                }),
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

  return { attributes: [schema], key: "Edit" } as IFormMetaData;
};
