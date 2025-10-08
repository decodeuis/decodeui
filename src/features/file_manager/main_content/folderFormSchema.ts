import { createStore } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { useToast } from "~/components/styled/modal/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { evalExpression } from "~/lib/expression_eval";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { parentDirectory } from "~/lib/meta/file/File";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { useFileManagerStore } from "../FileManagerContext";
import type { Vertex } from "~/lib/graph/type/vertex";

const folderFormSchema = {
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
              text: "Folder Name",
              validation: { required: true },
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "SystemTextInput",
              key: "key",
              placeholder: "Enter folder name",
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

export const getFolderFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();
  const [fileManagerStore] = useFileManagerStore();

  const validateForm = (options: FunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter folder name");
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

      const currentItem = fileManagerStore.selectedItem;
      if (!currentItem) {
        showErrorToast("No parent folder selected");
        return;
      }

      const folder: Vertex =
        currentItem.L[0] === "Folder"
          ? currentItem
          : evalExpression("->ParentFolder", {
              graph: options.graph,
              setGraph: options.setGraph,
              vertexes: [currentItem],
            })[0];

      const newFormTxnId = generateNewTxnId(options.graph, options.setGraph);
      const createResult = createFormVertex(
        options.graph,
        options.setGraph,
        newFormTxnId,
        "Folder",
        {
          description: formData.P.description,
          key: formData.P.key,
        },
      );

      if (!createResult.vertex) {
        showErrorToast("Failed to create folder");
        return;
      }

      const parentFolderMetaVertex = {
        id: "",
        IN: {},
        L: [],
        OUT: {},
        P: parentDirectory,
      } as Vertex;

      setSelectionValue(
        newFormTxnId,
        createResult.vertex,
        options.graph,
        options.setGraph,
        parentFolderMetaVertex,
        folder.id,
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
        options.ensureData();
        showSuccessToast("Folder created successfully");
        const modalState = options.contextData.modalState as ModalStateStore;
        modalState[1]("showModal", false);
        fileManagerStore.gridStore?.[0].fetchTableData();
        onSuccess();
      } else {
        showErrorToast("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      showErrorToast("Failed to create folder");
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
        text: "Add New Folder",
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
          addEditButtonSchema("Folder"),
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
                      {
                        attributes: [
                          modalHeaderSchema,
                          folderFormSchema,
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

  return { attributes: [schema], key: "Folder" } as IFormMetaData;
};
