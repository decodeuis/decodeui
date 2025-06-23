/* eslint-disable react/jsx-key */
import { useChat } from "@ai-sdk/solid";
import { For, Show } from "solid-js";
import { As } from "~/components/As";

export function UseChatTools() {
  const { addToolResult, handleInputChange, handleSubmit, input, messages } =
    useChat({
      api: "/api/use-chat-tools",
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === "getLocation") {
          const cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "San Francisco",
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  margin: 24px auto;
  /* stretch */
}\`;`}
    >
      <For each={messages()} fallback={<As as="div">No messages</As>}>
        {(message) => (
          <As
            as="div"
            css={`return \`._id {
  white-space: pre-wrap;
}\`;`}
          >
            <As as="strong">{`${message.role}: `}</As>
            {message.content}
            <For each={message.toolInvocations || []}>
              {(toolInvocation) => (
                <Show
                  fallback={
                    <Show
                      fallback={
                        <As
                          as="div"
                          css={`return \`._id {
  color: \${args.theme.var.color.gray};
}\`;`}
                        >
                          Calling {toolInvocation.toolName}...
                        </As>
                      }
                      keyed
                      when={"result" in toolInvocation && toolInvocation}
                    >
                      {(toolInvocation) => (
                        <As
                          as="div"
                          css={`return \`._id {
  color: \${args.theme.var.color.gray};
}\`;`}
                        >
                          Tool call {`${toolInvocation.toolName}: `}
                          {toolInvocation.result}
                        </As>
                      )}
                    </Show>
                  }
                  keyed
                  when={
                    toolInvocation.toolName === "askForConfirmation" &&
                    toolInvocation
                  }
                >
                  {(toolInvocation) => (
                    <As
                      as="div"
                      css={`return \`._id {
  color: \${args.theme.var.color.gray};
}\`;`}
                    >
                      {toolInvocation.args.message}
                      <As
                        as="div"
                        css={`return \`._id {
  display: flex;
  gap: 2px;
}\`;`}
                      >
                        <Show
                          fallback={
                            <>
                              <As
                                as="button"
                                css={`return \`._id {
  padding: 4px;
  font-weight: bold;
  color: \${args.theme.var.color.white};
  background-color: \${args.theme.var.color.blue};
  border-radius: 4px;
}\`;`}
                                onClick={() =>
                                  addToolResult({
                                    result: "Yes, confirmed.",
                                    toolCallId: toolInvocation.toolCallId,
                                  })
                                }
                              >
                                Yes
                              </As>
                              <As
                                as="button"
                                css={`return \`._id {
  padding: 4px;
  font-weight: bold;
  color: \${args.theme.var.color.white};
  background-color: \${args.theme.var.color.red};
  border-radius: 4px;
}\`;`}
                                onClick={() =>
                                  addToolResult({
                                    result: "No, denied",
                                    toolCallId: toolInvocation.toolCallId,
                                  })
                                }
                              >
                                No
                              </As>
                            </>
                          }
                          keyed
                          when={"result" in toolInvocation && toolInvocation}
                        >
                          {(toolInvocation) => <b>{toolInvocation.result}</b>}
                        </Show>
                      </As>
                    </As>
                  )}
                </Show>
              )}
            </For>
            <br />
            <br />
          </As>
        )}
      </For>

      <form onSubmit={handleSubmit}>
        <As
          as="input"
          css={`return \`._id {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 300px;
  padding: 2px;
  border: 1px solid \${args.theme.var.color.gray_light_400};
  border-radius: 4px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}\`;`}
          onChange={handleInputChange}
          placeholder="Say something..."
          value={input()}
        />
      </form>
    </As>
  );
}
