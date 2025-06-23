import { useChat } from "@ai-sdk/solid";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { insertNewRow } from "~/components/fields/table_field/functions/insertNewRow";
import { getGlobalThemeVertex } from "~/lib/graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { deleteRow } from "~/lib/graph/mutate/vertex/delete/deleteRow";
import { STYLES } from "~/pages/settings/constants";

import type { DBMessage } from "./types";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatResponse } from "./chat_response/ChatResponse";
import { getChatHistory } from "./functions/getChatHistory";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function UseObjectAIPanel() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const formStoreVertex = () =>
    layoutStoreVertex().P.mainFormId
      ? (graph.vertexes[
          layoutStoreVertex().P.mainFormId!
        ] as Vertex<FormStoreObject>)
      : undefined;
  const messages = createMemo(() =>
    getChatHistory(graph, setGraph, formStoreVertex),
  );

  const [showExamples, setShowExamples] = createSignal(false);
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  const [lastRequestPrompt, setLastRequestPrompt] = createSignal<string>("");
  const [lastSelectedModel, setLastSelectedModel] = createSignal<string>("");

  let chatHistoryRef: HTMLDivElement | undefined;
  let examplesButtonRef: HTMLButtonElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  const globalTheme = () => themeConfig(getGlobalThemeVertex(graph));

  // Add onMount to scroll to bottom initially
  onMount(() => {
    if (chatHistoryRef) {
      setTimeout(() => {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }, 1500);
    }
  });

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages: chatMessages,
    reload,
    setMessages,
    stop,
  } = useChat({
    onFinish(message) {
      const content = message.content;
      let data: unknown[] = [];

      // Try to parse the entire content as JSON array first
      try {
        const parsed = JSON.parse(content);
        data = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If that fails, try to find JSON code blocks
        const jsonMatches = [...content.matchAll(/```json\n([\s\S]*?)\n```/g)];
        if (jsonMatches.length > 0) {
          try {
            const parsed = JSON.parse(jsonMatches[0][1]);
            data = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If JSON parsing fails, leave data as empty array
          }
        }
      }

      // Create content preview from first 100 characters
      const contentPreview =
        content.slice(0, 100) + (content.length > 100 ? "..." : "");

      const messageData = {
        contentPreview,
        data: JSON.stringify(data),
        hasFile: !!files(),
        model: lastSelectedModel(),
        prompt: lastRequestPrompt(),
        response: content,
        timestamp: Date.now(),
        // Removing attachments from DB storage
        // attachments: files() ? Array.from(files()!) : undefined
      } as DBMessage;

      if (!formStoreVertex()) {
        return;
      }

      insertNewRow(
        formStoreVertex()!.P.txnId,
        { P: { type: "ChatHistory" } } as unknown as Vertex,
        graph.vertexes[formStoreVertex()!.P.formDataId!],
        false,
        graph,
        setGraph,
        messageData,
      );

      setTimeout(() => {
        if (chatHistoryRef) {
          chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
        }
      }, 0);

      if (!error()) {
        // clear input and files on successful completion
        // @ts-expect-error ignore error
        handleInputChange({ target: { value: "" } });
        setFiles(undefined);
        if (fileInputRef) {
          fileInputRef.value = "";
        }
      }
    },
    onResponse() {},
  });

  const handleChatSubmit = (e: SubmitEvent, model: string) => {
    e.preventDefault();
    if (!input().trim() || isLoading()) {
      return;
    }

    setLastRequestPrompt(input());
    setLastSelectedModel(model);
    handleSubmit(e, {
      body: {
        extraMessages: [
          {
            content: `
You are a designer.
You have access to the following theme variables:
\`\`\`json
${JSON.stringify(globalTheme())}
\`\`\`
you can use above theme variables in css properties, like: \`\${args.theme.var.color.background_light_900}\`.

Choose colors that work well for the context and maintain good contrast ratios.
`.trim(),
            role: "system",
          },
        ],
        model: model,
      },
      experimental_attachments: files(),
    });

    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const handleExampleClick = (example: string) => {
    // @ts-expect-error ignore error
    handleInputChange({ target: { value: example } });
    setShowExamples(false);
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
  background: \${args.theme.var.color.background_light_50};
}\`;`}
    >
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
            padding: 16px;
            scroll-behavior: smooth;
            background: linear-gradient(to bottom, \${args.theme.var.color.background_light_50}, \${args.theme.var.color.background_light_100});
          }\`;`,
        ]}
        class="chat-history"
        ref={chatHistoryRef!}
      >
        <For each={messages()}>
          {(message, index) => (
            <As
              as="div"
              css={[
                `return \`._id {
  margin-bottom: 28px;
  animation: fadeIn 0.3s ease-in-out;
}\`;`,
                `return \`@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}\`;`,
              ]}
            >
              <ChatMessage
                index={index() + 1}
                message={message}
                onDelete={(msg) =>
                  deleteRow(
                    msg,
                    false,
                    graph,
                    setGraph,
                    formStoreVertex()!.P.txnId!,
                  )
                }
              />
              <ChatResponse message={message} />
            </As>
          )}
        </For>

        <Show when={error()}>
          <As
            as="div"
            css={[
              (_args: FunctionArgumentType) => `return \`._id {
  padding: 16px;
  margin-bottom: 16px;
  color: \${args.theme.var.color.error};
  background: \${args.theme.var.color.error_light_50};
  border-radius: 8px;
  border: 1px solid \${args.theme.var.color.error_light_100};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}\`;`,
            ]}
          >
            <As as="span">An error occurred. {error()?.message}</As>
            <As
              as="button"
              css={`return \`._id {
  padding: 8px 16px;
  color: \${args.theme.var.color.primary_text};
  background: \${args.theme.var.color.primary};
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: \${args.theme.var.color.primary_light_200};
  }
}\`;`}
              onClick={() => reload()}
              type="button"
            >
              Retry
            </As>
          </As>
        </Show>

        <Show when={isLoading()}>
          <As
            as="div"
            css={[
              `return \`._id {
  padding: 16px;
  color: \${args.theme.var.color.text_light_300};
  display: flex;
  gap: 12px;
  align-items: center;
  background: \${args.theme.var.color.background_light_100};
  border-radius: 8px;
  margin-bottom: 16px;
}\`;`,
            ]}
          >
            <As
              as="div"
              css={[
                `return \`._id {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}\`;`,
              ]}
            >
              <As
                as="div"
                css={[
                  `return \`._id {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid \${args.theme.var.color.border};
  border-top-color: \${args.theme.var.color.primary};
  animation: spin 1s infinite linear;
}\`;`,
                  `return \`@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}\`;`,
                ]}
              />
              <As
                as="span"
                css={`return \`._id {
                  font-weight: 500;
                }\`;`}
              >
                AI is thinking...
              </As>
            </As>
            <As
              as="button"
              css={`return \`._id {
  padding: 8px 16px;
  color: \${args.theme.var.color.error_text};
  background: \${args.theme.var.color.error};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: \${args.theme.var.color.error_light_200};
  }
}\`;`}
              onClick={() => stop()}
              type="button"
            >
              Stop
            </As>
          </As>
        </Show>
      </As>

      <ChatInput
        chatMessages={chatMessages()}
        examplesButtonRef={examplesButtonRef}
        fileInputRef={fileInputRef}
        files={files}
        input={input}
        isLoading={isLoading}
        onClearMessages={() => setMessages([])}
        onExampleClick={handleExampleClick}
        onExamplesToggle={setShowExamples}
        onFilesChange={(files) => setFiles(files)}
        onInputChange={handleInputChange}
        onSubmit={handleChatSubmit}
        showExamples={showExamples}
      />
    </As>
  );
}
