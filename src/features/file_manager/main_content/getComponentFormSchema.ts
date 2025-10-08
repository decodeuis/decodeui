import { createStore as createSolidJsStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { useToast } from "~/components/styled/modal/Toast";
import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { parentCompAttribute, parentPermAttribute } from "~/lib/meta/base/Comp";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { useFileManagerStore } from "../FileManagerContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define a type for function arguments with modalState in contextData
interface ComponentFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    modalState: ModalStateStore;
    [key: string]: unknown;
  };
}

export const getComponentFormSchema = (
  onSuccess: () => void,
  onClose: () => void,
  saveAsLabel?: "Comp" | "Perm",
) => {
  const { showErrorToast, showSuccessToast } = useToast();
  const [fileManagerStore] = useFileManagerStore();
  const label = () => (saveAsLabel === "Perm" ? "Permission" : "Component");

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast(`Please enter ${label().toLowerCase()} name`);
      return false;
    }
    return true;
  };

  const handleSave = async (options: ComponentFormFunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    const res = await checkUniqueConstrains({
      L: [saveAsLabel || "Comp"],
      P: { key: formData.P.key },
      id: formData.id,
    } as unknown as Vertex);
    if (res.error) {
      showErrorToast(
        typeof res.error === "string"
          ? res.error
          : "Unique constraint validation failed",
      );
      return;
    }

    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);

      const newFormTxnId = generateNewTxnId(options.graph, options.setGraph);
      const formVertex = formData;

      if (formData.id.startsWith("-")) {
        const createResult = createFormVertex(
          options.graph,
          options.setGraph,
          newFormTxnId,
          saveAsLabel || "Comp",
          {
            description: formVertex.P.description,
            key: formVertex.P.key,
          },
        );
        const dataVertex = createResult.vertex!;

        const parentFolderMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P: saveAsLabel === "Perm" ? parentPermAttribute : parentCompAttribute,
        } as Vertex;

        setSelectionValue(
          newFormTxnId,
          dataVertex,
          options.graph,
          options.setGraph,
          parentFolderMetaVertex,
          fileManagerStore.selectedItem!.id,
        );
      } else {
        const updateResult = mergeVertexProperties(
          newFormTxnId,
          formData.id,
          options.graph,
          options.setGraph,
          {
            description: formVertex.P.description,
            key: formVertex.P.key,
          },
        );

        if (updateResult.error) {
          showErrorToast(updateResult.error);
          return;
        }
      }

      const commitData = commitTxn(newFormTxnId, options.graph);

      if (!commitData) {
        showErrorToast(`Failed to upload ${label()}`);
        return;
      }

      const result = await submitDataCall(
        { ...commitData },
        options.graph,
        options.setGraph,
        newFormTxnId,
      );

      if (getErrorMessage(result)) {
        showErrorToast(getErrorMessage(result));
      } else {
        // options.removeTxnIdAndCreateNew(options.txnId);
        // as we are creating new transaction, we need to revert to previous state
        options.revertTransactionUpToIndex(options.txnId, -1);
        options.ensureData();
        showSuccessToast(`${label()} created successfully`);
        const modalState = options.contextData.modalState;
        modalState[1]("showModal", false);
        fileManagerStore.gridStore?.[0].fetchTableData();
        onSuccess();
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      const modalState = options.contextData.modalState;
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
        text: `Add New ${label()}`,
      },
    ],
    css: SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
    componentName: "Html",
  };

  const componentFormSchema = {
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
                text: `${label()} Name`,
                validation: { required: true },
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "key",
                placeholder: `Enter ${label().toLowerCase()} name`,
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

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        componentName: "Html",
        props: (options: ComponentFormFunctionArgumentType) => ({
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
        props: (options: ComponentFormFunctionArgumentType) => ({
          disabled: options.contextData.modalState[0]?.isLoading,
          onClick: () => {
            const modalState = options.contextData.modalState;
            modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
            options.ensureData();
            onClose();
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
          addEditButtonSchema(saveAsLabel || "Comp"),
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "div",
                    attributes: [],
                    css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
                    componentName: "Html",
                    props: (options: ComponentFormFunctionArgumentType) => ({
                      hide: !options.contextData.modalState[0]?.showModal,
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
                          componentFormSchema,
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
                    props: (options: ComponentFormFunctionArgumentType) => ({
                      onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                      },
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                      beforeMount: () => {
                        // Create focus trap
                        createFocusTrap({
                          element: options.ref,
                          enabled: () =>
                            options.contextData.modalState[0]?.showModal,
                          observeChanges: true,
                          restoreFocus: true,
                        });
                      },
                    }),
                  },
                ],
                componentName: "Html",
                as: "portal",
                props: (options: ComponentFormFunctionArgumentType) => ({
                  hide: !options.contextData.modalState[0]?.showModal,
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
      data: createSolidJsStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: saveAsLabel || "Comp" } as IFormMetaData;
};
