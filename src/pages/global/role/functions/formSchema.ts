import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";
import type { GraphData } from "~/lib/types/GraphData";

import { useToast } from "~/components/styled/modal/Toast";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "~/lib/schema/loadingIconSchema";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define the type for tabState store
type TabStateStore = ReturnType<
  typeof createStore<{
    activeTab: string;
  }>
>;

// Extend FunctionArgumentType to include our contextData
interface RoleFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    modalState: ModalStateStore;
    tabState: TabStateStore;
    [key: string]: unknown;
  };
}

export const permissionsTableSchema = (label: string) =>
  ({
    attributes: [
      {
        collection: `g:'${label}'`,
        componentName: "Select",
        key: label,
      },
      {
        componentName: "Select",
        displayName: "Access Level",
        key: "access",
        options: `NONE
VIEW
CREATE
EDIT
FULL`,
      },
      // {
      //   componentName: "SystemTextInput",
      //   key: "scope",
      // },
    ],
    componentName: "DynamicTable",
    key: label,
  }) as FieldAttribute;

export const roleFormSchema = {
  as: "div",
  attributes: [
    loadingIconSchema(),
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
              placeholder: "Enter role name",
              props: (options: FunctionArgumentType) => ({
                disabled:
                  !options.data?.id.startsWith("-") &&
                  // TODO: fix, after rename to Admin, the field is disabled.
                  Object.values(SYSTEM_ROLES).includes(options.data?.P.key),
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
              text: "Description",
            },
            {
              css: PROPERTIES.Css.TextFieldCss,
              componentName: "SystemTextInput",
              key: "description",
              placeholder: "Enter role description",
            },
          ],
          css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
          componentName: "Html",
        },
      ],
      css: SETTINGS_CONSTANTS.FORM_CSS,
      componentName: "Html",
    },
    {
      attributes: [
        {
          as: "div",
          attributes: [
            {
              as: "button",
              componentName: "Html",
              css: (args: RoleFormFunctionArgumentType) => {
                return [
                  `return \`._id {
                cursor: pointer;
                padding: 8px 16px;
                background-color: transparent;
                border-left: none;
                border-right: none;
                border-top: none;
                }\`;`,
                  args.contextData.tabState[0]?.activeTab === "Perm"
                    ? `return \`._id {border-bottom: 2px solid \${args.theme.var.color.primary};}\`;`
                    : `return \`._id {border-bottom: 2px solid transparent;}\`;`,
                ];
              },
              props: (options: RoleFormFunctionArgumentType) => {
                const permissions = evalExpression("->RolePerm", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  onClick: () =>
                    options.contextData.tabState[1]("activeTab", "Perm"),
                  text: `Permissions ${options.contextData.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
            {
              as: "button",
              componentName: "Html",
              css: (options: RoleFormFunctionArgumentType) => [
                `return \`._id {
                cursor: pointer;
                padding: 8px 16px;
                background-color: transparent;
                border-left: none;
                border-right: none;
                border-top: none;
              }\`;`,
                options.contextData.tabState[0]?.activeTab === "Page"
                  ? `return \`._id {border-bottom: 2px solid \${options.theme.var.color.primary};}\`;`
                  : `return \`._id {border-bottom: 2px solid transparent;}\`;`,
              ],
              props: (options: RoleFormFunctionArgumentType) => {
                const permissions = evalExpression("->RolePage", {
                  graph: options.graph,
                  setGraph: options.setGraph,
                  vertexes: [options.data],
                });
                return {
                  onClick: () =>
                    options.contextData.tabState[1]("activeTab", "Page"),
                  text: `Pages ${options.contextData.modalState[0]?.isLoading ? "" : `(${(permissions || []).length})`}`,
                };
              },
              type: "button",
            },
          ],
          css: `return \`._id {
  display: flex;
  border-bottom: 1px solid \${args.theme.var.color.background_light_200};
}\`;`,
          componentName: "Html",
        },
        {
          as: "div",
          attributes: [
            {
              as: "div",
              attributes: [permissionsTableSchema("Perm")],
              componentName: "Html",
              css: (options: RoleFormFunctionArgumentType) =>
                options.contextData.tabState[0]?.activeTab === "Perm"
                  ? ""
                  : `return \`._id {display:none;}\`;`,
            },
            {
              as: "div",
              attributes: [permissionsTableSchema("Page")],
              componentName: "Html",
              css: (options: RoleFormFunctionArgumentType) =>
                options.contextData.tabState[0]?.activeTab === "Page"
                  ? ""
                  : `return \`._id {display:none;}\`;`,
            },
          ],
          css: `return \`._id {
  margin-top: 16px;
  padding: 8px;
}\`;`,
          componentName: "Html",
        },
      ],
      componentName: "Html",
      contextName: "tabState",

      props: () => ({
        data: createStore({
          activeTab: "Perm",
        }),
      }),
    },
  ],
  componentName: "Html",
  props: (options: RoleFormFunctionArgumentType) => {
    return {
      onMount: async () => {
        if (!options.data?.id.startsWith("-")) {
          try {
            const modalState = options.contextData.modalState;
            modalState[1]("isLoading", true);
            const response = await postAPI(API.role.getRoleUrl, {
              id: options.data?.id,
            });
            if (response.error) {
              throw new Error(String(response.error));
            }
            options.setGraphData(0, response.graph as GraphData, {});
          } catch (error) {
            options.showErrorToast((error as Error).message);
          } finally {
            const modalState = options.contextData.modalState;
            modalState[1]("isLoading", false);
          }
        }
      },
    };
  },
};

export const getRoleFormSchema = (onSuccess: () => void) => {
  const { showErrorToast, showSuccessToast } = useToast();

  const validateForm = (formData: Vertex) => {
    if (!formData.P.key?.trim()) {
      showErrorToast("Please enter role name");
      return false;
    }
    return true;
  };

  const handleSave = async (options: RoleFormFunctionArgumentType) => {
    const formData = options.data;
    if (!validateForm(formData)) {
      return;
    }

    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);
      const data = commitTxn(options.txnId, options.graph);
      if (!data) {
        return;
      }
      const response = await postAPI(API.role.upsertRoleUrl, {
        data,
        role: formData,
      });

      if (response.error) {
        showErrorToast(String(response.error));
      } else {
        // First convert to unknown, then to MutationResult to satisfy TypeScript
        const typedResponse = response as unknown as MutationResult;
        onMutatDataGet(options.graph, options.setGraph, typedResponse);
        options.removeTxnIdAndCreateNew(options.txnId);
        options.ensureData();
        showSuccessToast("Role created successfully");
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

  // Modal schemas similar to SubDomainForm
  const modalHeaderSchema = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS,
        componentName: "Html",
        text: "Add New Role",
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
        props: (options: RoleFormFunctionArgumentType) => ({
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
        props: (options: RoleFormFunctionArgumentType) => ({
          onClick: () => {
            const modalState = options.contextData.modalState;
            modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
            options.ensureData();
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
          addEditButtonSchema("Role"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: RoleFormFunctionArgumentType) => ({
              hide: !options.contextData.modalState[0]?.showModal,
            }),
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
                          roleFormSchema,
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
                    props: (options: RoleFormFunctionArgumentType) => ({
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
                props: (options: RoleFormFunctionArgumentType) => ({
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
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "Role" } as IFormMetaData;
};
