import animateScrollTo from "animated-scroll-to";
import { createStore } from "solid-js/store";

import type { FunctionArgumentType as BaseArgType } from "~/components/form/type/FieldSchemaType";
import type { MutationResult } from "~/cypher/types/MutationArgs";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import type { GraphData } from "~/lib/types/GraphData";
import type { Vertex } from "~/lib/graph/type/vertex";

type ModalStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
    showModal: boolean;
  }>
>;

type ReplyStateStore = ReturnType<
  typeof createStore<{
    replyText: string;
  }>
>;

interface FunctionArgumentType extends BaseArgType {
  contextData: {
    modalState: ModalStateStore;
    replyState?: ReplyStateStore;
    history?: Vertex;
    [key: string]: unknown;
  };
}

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { onMutatDataGet } from "~/lib/graph/mutate/data/onMutatDataGet";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { addEditButtonSchema } from "~/pages/subdomain/functions/addEditButtonSchema";

import { loadingIconSchema } from "~/lib/schema/loadingIconSchema";

export const getSupportTicketFormSchema = (onSuccess: () => void) => {
  const actionButtonsSchema = {
    as: "div",
    attributes: [
      {
        as: "button",
        css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
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
        props: (options: FunctionArgumentType) => ({
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
    css: SETTINGS_CONSTANTS.MODAL.FOOTER.CSS.replace("top", "bottom"),
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      hide: !isAdminRole(options.graph),
    }),
  };
  const chatHistorySchema = {
    attributes: [
      {
        collection: "g:'Reply'",
        componentName: "MultiSelect",
        displayName: "Parent Support",
        inward: true,
        key: "ParentSupport",
        props: () => ({
          hide: true,
        }),
        type: "ParentSupport",
      },
      {
        as: "span",
        css: SETTINGS_CONSTANTS.LABEL_CSS,
        componentName: "Html",
        text: "Replies",
      },
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    attributes: [
                      {
                        as: "div",
                        attributes: [
                          {
                            as: "div",
                            attributes: [
                              {
                                as: "div",
                                attributes: [
                                  {
                                    as: "div",
                                    css: `return \`._id {
  font-weight: bold;
}\`;`,
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text:
                                        options.contextData.history?.P?.email ||
                                        "Anonymous",
                                    }),
                                  },
                                  {
                                    as: "div",
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text:
                                        options.contextData.history?.P
                                          ?.message || "",
                                    }),
                                  },
                                  {
                                    as: "div",
                                    css: `return \`._id {
  font-size: 12px;
  color: \${args.theme.var.color.text};
}\`;`,
                                    componentName: "Html",
                                    props: (options: FunctionArgumentType) => ({
                                      text: options.contextData.history?.P
                                        ?.createdAt
                                        ? new Date(
                                            options.contextData.history.P
                                              .createdAt,
                                          ).toLocaleString()
                                        : "",
                                    }),
                                  },
                                ],
                                componentName: "Html",
                                css: () => {
                                  // const isUser = options.data?.P.email !== "Support";
                                  // ${isUser ? 'bg:primary-10' : 'bg:base-10'}
                                  return `return \`._id {
  display: inline-block;
  padding: 8px;
  border-radius: 6px;
}\`;`;
                                },
                              },
                            ],
                            componentName: "Html",
                            css: () => {
                              // const isUser = options.data?.P.email !== "Support";
                              // isUser ? 'text-align:right;' : ''}`
                              return `return \`._id {
  margin-bottom: 8px;
}\`;`;
                            },
                          },
                        ],
                        componentName: "Html",
                      },
                    ],
                    componentName: "Data",
                    loop: true,
                    name: "history",
                    props: (options: FunctionArgumentType) => ({
                      data: () =>
                        evalExpression("<-ParentSupport", {
                          graph: options.graph,
                          setGraph: options.setGraph,
                          vertexes: [options.graph.vertexes[options.data?.id]],
                        }).sort(
                          (a: Vertex, b: Vertex) =>
                            new Date(a.P.createdAt).getTime() -
                            new Date(b.P.createdAt).getTime(),
                        ),
                    }),
                    // emptyState: {
                    //   as: "div",
                    //   css: `return \`._id {
                    //   padding: 8px;
                    //   text-align: center;
                    //   color: #1e293b;
                    // }\`;`,
                    //   componentName: "Html",
                    //   text: "No messages yet",
                    // },
                  },
                ],
                css: `return \`._id {
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 6px;
  padding: 12px;
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.background_light_100_text};
  scrollbar-width: thin;
  scrollbar-color: \${args.theme.var.color.border} \${args.theme.var.color.background_light_300};
}\`;`,
                componentName: "Html",
                class: "chat-history-container",
              },
              {
                as: "div",
                attributes: [
                  {
                    as: "div",
                    attributes: [
                      {
                        css: [
                          PROPERTIES.Css.TextFieldCss,
                          `return \`._id {
                            flex-grow: 1;
                            margin-right: 8px;
                          }\`;`,
                        ],
                        componentName: "SystemTextInput",
                        type: "textarea",
                        key: "newReply",
                        placeholder: "Type your reply here...",
                        props: (options: FunctionArgumentType) => ({
                          onInput: (e: { target: HTMLTextAreaElement }) => {
                            options.contextData.replyState?.[1]?.(
                              "replyText",
                              e.target.value,
                            );
                          },
                          value:
                            options.contextData.replyState?.[0]?.replyText ||
                            "",
                        }),
                      },
                      {
                        as: "button",
                        css: `return \`._id {
  background-color: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  padding: 8px 16px;  
  border-radius: 6px;
  border: none;
}\`;`,
                        componentName: "Html",
                        props: (options: FunctionArgumentType) => ({
                          disabled:
                            !options.contextData.replyState?.[0]?.replyText?.trim(),
                          onClick: async () => {
                            if (!options.contextData.replyState?.[0]) {
                              return;
                            }
                            const replyText =
                              options.contextData.replyState[0].replyText;
                            if (!replyText?.trim()) {
                              return;
                            }

                            try {
                              const modalState = options.contextData.modalState;
                              modalState[1]("isLoading", true);

                              // Add reply to the ticket
                              const response = await postAPI(
                                API.support.replyUrl,
                                {
                                  message: replyText,
                                  ticketId: options.data?.id,
                                },
                              );

                              if (response.error) {
                                throw new Error(response.error as string);
                              }

                              // Update the graph with the new data
                              if (response.graph) {
                                setGraphData(
                                  options.graph,
                                  options.setGraph,
                                  response.graph as GraphData,
                                  { skipExisting: true },
                                );
                              }

                              // Clear the input field

                              options.contextData.replyState[1](
                                "replyText",
                                "",
                              );

                              // Show success message
                              options.showSuccessToast(
                                "Reply sent successfully",
                              );

                              // Scroll chat history to the bottom
                              setTimeout(() => {
                                const chatHistory = document.querySelector(
                                  ".chat-history-container",
                                );
                                if (chatHistory) {
                                  animateScrollTo(chatHistory.scrollHeight, {
                                    elementToScroll: chatHistory,
                                  });
                                }
                              }, 100);
                            } catch (error) {
                              options.showErrorToast((error as Error).message);
                            } finally {
                              const modalState = options.contextData.modalState;
                              modalState[1]("isLoading", false);
                            }
                          },
                        }),
                        text: "Send",
                        type: "button",
                      },
                    ],
                    css: `return \`._id {
  display: flex;
  gap: 2px;
  margin-top: 8px;
}\`;`,
                    componentName: "Html",
                  },
                ],
                componentName: "Html",
              },
            ],
            componentName: "Html",
          },
        ],
        componentName: "Html",
      },
    ],
    componentName: "Data",
    name: "replyState",

    props: () => ({
      data: createStore({
        replyText: "",
      }),
    }),
  } as IFormMetaData;
  const supportTicketFormSchema = {
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
                text: "Status",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                collection: "g:'SupportStatus'",
                componentName: "Select",
                key: "SupportStatus",
                labelKey: "::'P.name'",
                props: (options: FunctionArgumentType) => ({
                  disabled: !isAdminRole(options.graph),
                }),
                title: "Status",
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
                text: "Message",
              },
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                type: "textarea",
                key: "message",
                props: (options: FunctionArgumentType) => ({
                  disabled: true,
                  value: options.data?.P.message,
                }),
              },
            ],
            css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
            componentName: "Html",
          },
          actionButtonsSchema,
        ],
        css: SETTINGS_CONSTANTS.FORM_CSS,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => {
      return {
        onMount: async () => {
          try {
            const modalState = options.contextData.modalState;
            modalState[1]("isLoading", true);
            const response = await postAPI(API.support.getTicketUrl, {
              id: options.data?.id,
            });
            if (response.error) {
              throw new Error(response.error as string);
            }
            if (response.graph) {
              options.setGraphData(0, response.graph as GraphData, {});
            }
          } catch (error) {
            options.showErrorToast((error as Error).message);
          } finally {
            const modalState = options.contextData.modalState;
            modalState[1]("isLoading", false);
            // Scroll chat history to the bottom on mount
            setTimeout(() => {
              const chatHistory = document.querySelector(
                ".chat-history-container",
              );
              if (chatHistory) {
                animateScrollTo(chatHistory.scrollHeight, {
                  elementToScroll: chatHistory,
                });
              }
            }, 100);
          }
        },
        onUnmount: () => {
          options.revertTransactionUpToIndex(options.txnId, -1);
        },
      };
    },
  };

  const handleSave = async (options: FunctionArgumentType) => {
    try {
      const modalState = options.contextData.modalState;
      modalState[1]("isLoading", true);
      const data = commitTxn(options.txnId, options.graph);
      if (!data) {
        return;
      }
      const response = await postAPI(API.support.upsertTicketUrl, {
        data,
        ticket: options.data,
      });

      if (response.error) {
        options.showErrorToast(response.error as string);
      } else {
        options.removeTxnIdAndCreateNew(options.txnId);
        options.ensureData();
        onMutatDataGet(
          options.graph,
          options.setGraph,
          response as unknown as MutationResult,
        );
        options.showSuccessToast("Support ticket updated successfully");
        const modalState = options.contextData.modalState;
        modalState[1]("showModal", false);
        onSuccess();
      }
    } catch (error) {
      options.showErrorToast((error as Error).message);
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
        text: "Edit Support Ticket",
      },
      {
        as: "button",
        attributes: [
          {
            componentName: "Html",
            as: "icon",
            icon: "ph:x",
          },
        ],
        css: `return \`._id {
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: \${args.theme.var.color.text};
  font-size: 20px;
  &:hover {
    color: \${args.theme.var.color.primary};
  }
}\`;`,
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          onClick: () => {
            const modalState = options.contextData.modalState;
            modalState[1]("showModal", false);
            options.revertTransactionUpToIndex(options.txnId, -1);
          },
        }),
      },
    ],
    css: [
      SETTINGS_CONSTANTS.MODAL.HEADER.CSS,
      `return \`._id {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }\`;`,
    ],
    componentName: "Html",
  };

  const schema = {
    attributes: [
      {
        as: "div",
        attributes: [
          addEditButtonSchema("Support"),
          {
            as: "div",
            attributes: [],
            css: SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
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
                      modalHeaderSchema,
                      supportTicketFormSchema,
                      {
                        as: "div",
                        attributes: [chatHistorySchema],
                        css: `return \`._id {
  padding: 4px;
}\`;`,
                        componentName: "Html",
                      },
                    ],
                    css: SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
                    componentName: "Html",
                    open: true,
                    props: (options: FunctionArgumentType) => ({
                      style: {
                        "z-index": options.zIndex + 1,
                      },
                      onMount: () => {
                        const textareas =
                          document.getElementsByTagName("textarea");
                        for (let i = 0; i < textareas.length; i++) {
                          if (textareas[i].tabIndex !== -1) {
                            textareas[i].focus();
                            break;
                          }
                        }
                      },
                    }),
                  },
                ],
                componentName: "Html",
                as: "portal",
                props: (options: FunctionArgumentType) => ({
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

    props: () => ({
      data: createStore({
        isLoading: false,
        showModal: false,
      }),
    }),
  };

  return { attributes: [schema], key: "Support" } as IFormMetaData;
};
