import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";
import type * as Monaco from "monaco-editor";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { createActiveClickOutside } from "~/lib/hooks/createActiveClickOutside";
import { validateFunction } from "~/lib/validation/validateFunction";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

type EditorState = ReturnType<
  typeof createSignal<Monaco.editor.IStandaloneCodeEditor>
>;
type ModalStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
    showModal: boolean;
    editorData?: string;
  }>
>;

// Define a type for the function argument with proper contextData typing
interface ThemeFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    modalState: ModalStateStore;
    editorState?: EditorState;
    [key: string]: unknown;
  };
}

export const themeFormSchema = {
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
              componentName: "Html",
              css: SETTINGS_CONSTANTS.LABEL_CSS,
              text: "Theme Name",
              validation: { required: true },
            },
            {
              componentName: "SystemTextInput",
              css: PROPERTIES.Css.TextFieldCss,
              key: "key",
              placeholder: "Enter theme name",
              validation: { required: true },
            },
          ],
          componentName: "Html",
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
        },
        {
          as: "div",
          attributes: [
            {
              as: "span",
              componentName: "Html",
              css: SETTINGS_CONSTANTS.LABEL_CSS,
              text: "Theme Configuration",
              validation: { required: true },
            },
            {
              key: "data",
              props: (options: ThemeFunctionArgumentType) => ({
                componentName: (props: Record<string, unknown>) => (
                  <MonacoEditorWrapper
                    height="400px"
                    language="javascript"
                    {...props}
                    onChange={(value) =>
                      options.contextData.modalState[1]("editorData", value)
                    }
                    onMount={(_monaco, editor) => {
                      if (options.contextData.editorState) {
                        options.contextData.editorState[1](editor);
                      }
                    }}
                    value={options.contextData.modalState[0]?.editorData}
                  />
                ),
              }),
            },
            {
              as: "div",
              attributes: [
                {
                  as: "button",
                  componentName: "Html",
                  css: `return \`._id {
                      padding: 5px;
                      background-color: \${args.theme.var.color.gray_light_720};
                      color: \${args.theme.var.color.text_light_900};
                      border-radius: 5px;
                    }\`;`,
                  props: (options: ThemeFunctionArgumentType) => ({
                    onClick: async () => {
                      if (options.contextData.editorState) {
                        const editor = options.contextData.editorState[0]();
                        if (editor) {
                          try {
                            const formatted = await formatJavaScriptCode(
                              editor.getValue(),
                            );
                            editor.setValue(formatted);
                          } catch (err) {
                            console.error("Formatting failed:", err);
                            if (options.showWarningToast) {
                              options.showWarningToast("Failed to format code");
                            }
                          }
                        }
                      }
                    },
                  }),
                  text: "Format",
                  type: "button",
                },
              ],
              componentName: "Html",
              css: `return \`._id {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }\`;`,
            },
          ],
          componentName: "Html",
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
        },
      ],
      componentName: "Html",
      css: SETTINGS_CONSTANTS.FORM_CSS,
    },
  ],
  componentName: "Html",
} as FieldAttribute;

export const getThemeFormSchema = (
  onSuccess: () => void,
  onClose: () => void,
) => {
  const { showErrorToast, showSuccessToast, showWarningToast } = useToast();
  const [graph, setGraph] = useGraph();

  createActiveClickOutside(graph, setGraph);

  const validateForm = (options: ThemeFunctionArgumentType) => {
    const formData = options.data;
    if (!formData.P.key?.trim() && formData.id.startsWith("-")) {
      showErrorToast("Please enter theme name");
      return false;
    }

    const modalState = options.contextData.modalState;
    const editorData = modalState[0]?.editorData?.trim();
    if (!editorData) {
      showErrorToast("Please enter theme configuration");
      return false;
    }

    const validation = validateFunction(editorData);
    if (!validation.isValid) {
      showErrorToast(validation.error || "Invalid theme configuration");
      return false;
    }

    return true;
  };

  const handleSave = async (options: ThemeFunctionArgumentType) => {
    if (!validateForm(options)) {
      return;
    }
    const formData = options.data;
    const formDataId = formData.id;

    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);

      const newFormTxnId = generateNewTxnId(graph, setGraph);
      let result;

      if (formDataId.startsWith("-")) {
        // Create new theme
        result = createFormVertex(graph, setGraph, newFormTxnId, "Theme", {
          data: options.contextData.modalState[0]?.editorData || "",
          key: formData.P.key,
        });
      } else {
        // Update existing theme
        result = mergeVertexProperties(
          newFormTxnId,
          formData.id,
          graph,
          setGraph,
          {
            data: options.contextData.modalState[0]?.editorData || "",
          },
        );
      }

      if (result.error) {
        showErrorToast(result.error as string);
        return;
      }

      const data = commitTxn(newFormTxnId, graph);
      if (!data) {
        showWarningToast("Internal Server Error");
        return;
      }

      try {
        await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
        // clicking on Add new Theme will create a new form..
        if (formDataId.startsWith("-")) {
          options.revertTransactionUpToIndex(options.txnId, -1);
        }
        showSuccessToast("Theme Saved Successfully");
        const modalState = options.contextData.modalState;
        modalState[1]("showModal", false);
        onSuccess();
      } catch (er) {
        showErrorToast(getErrorMessage(er));
      }
    } catch (error) {
      showErrorToast((error as Error).message);
    } finally {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", false);
    }
  };

  // Modal schemas
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        componentName: "Html",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        props: (options: FunctionArgumentType) => {
          return {
            text:
              options.data?.id && !options.data?.id.startsWith("-")
                ? `Configure Theme [${options.data?.P.key}]`
                : "Add New Theme",
          };
        },
      },
    ],
    componentName: "Html",
    css: SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
  };

  const modalFooterSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        componentName: "Html",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        props: (options: ThemeFunctionArgumentType) => ({
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
        componentName: "Html",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
        props: (options: ThemeFunctionArgumentType) => ({
          disabled: options.contextData.modalState[0]?.isLoading,
          onClick: () => {
            const modalState = options.contextData.modalState;
            modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
            onClose();
          },
          text: "Cancel",
        }),
        type: "button",
      },
    ],
    componentName: "Html",
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS,
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                attributes: [
                  {
                    as: "div",
                    attributes: [],
                    componentName: "Html",
                    css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
                    props: (options: ThemeFunctionArgumentType) => ({
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
                          themeFormSchema,
                          modalFooterSchema,
                        ],
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          formDataId: options.data?.id,
                        }),
                      },
                    ],
                    componentName: "Html",
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    open: true,
                    props: (options: ThemeFunctionArgumentType) => ({
                      onClick: (event: MouseEvent) => {
                        event.stopPropagation();
                      },
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                      beforeMount: () => {
                        createFocusTrap({
                          element: options.ref,
                          observeChanges: true,
                          restoreFocus: true,
                          initialFocusElement: () =>
                            document.getElementsByTagName("input")[0],
                        });
                      },
                    }),
                  },
                ],
                componentName: "Html",
                as: "portal",
                props: (options: ThemeFunctionArgumentType) => ({
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
    componentName: "Data",
    name: "modalState",

    props: (options: FunctionArgumentType) => ({
      data: createStore({
        editorData: options.data?.P.data ?? "",
        isLoading: false,
        showModal: true,
      }),
    }),
  };

  return {
    attributes: [
      {
        attributes: [schema],
        componentName: "Data",
        name: "editorState",

        props: () => ({
          data: createSignal<Monaco.editor.IStandaloneCodeEditor>(),
        }),
      },
    ],
    key: "Theme",
  } as IFormMetaData;
};
