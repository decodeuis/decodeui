/* eslint-disable @next/next/no-img-element */
import { useChat } from "@ai-sdk/solid";
import { getTextFromDataUrl } from "@ai-sdk/ui-utils";
import { createSignal, For } from "solid-js";
import { As } from "~/components/As";

export function UseChatAttachments() {
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages,
    reload,
    stop,
  } = useChat({
    onFinish(_message, { finishReason, usage }) {},
  });

  const onSend = async (e: Event) => {
    e.preventDefault();
    handleSubmit(e, {
      experimental_attachments: files(),
    });

    setFiles(undefined);
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 2px;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  padding: 2px;
  gap: 2px;
}\`;`}
      >
        <For each={messages()}>
          {(message) => (
            <As
              as="div"
              css={`return \`._id {
  display: flex;
  flex-direction: row;
  gap: 2px;
}\`;`}
            >
              <As
                as="div"
                css={`return \`._id {
  width: 24px;
  color: \${args.theme.var.color.gray};
  flex-shrink: 0;
}\`;`}
              >
                {`${message.role}: `}
              </As>

              <As
                as="div"
                css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 2px;
}\`;`}
              >
                {message.content}

                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  flex-direction: row;
  gap: 2px;
}\`;`}
                >
                  <For each={message.experimental_attachments}>
                    {(attachment, _index) =>
                      attachment.contentType?.includes("image/") ? (
                        <As
                          as="img"
                          alt={attachment.name}
                          css={`return \`._id {
  width: 24px;
  border-radius: 4px;
}\`;`}
                          src={attachment.url}
                        />
                      ) : attachment.contentType?.includes("text/") ? (
                        <As
                          as="div"
                          css={`return \`._id {
  width: 32px;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  padding: 2px;
  color: \${args.theme.var.color.gray};
  border: 1px solid \${args.theme.var.color.gray_dark_600};
}\`;`}
                        >
                          {getTextFromDataUrl(attachment.url)}
                        </As>
                      ) : null
                    }
                  </For>
                </As>
              </As>
            </As>
          )}
        </For>
      </As>

      {isLoading() && (
        <As
          as="div"
          css={`return \`._id {
  margin-top: 4px;
  color: \${args.theme.var.color.gray};
}\`;`}
        >
          <As as="div">Loading...</As>
          <As
            as="button"
            css={`return \`._id {
  padding: 4px;
  margin-top: 4px;
  color: \${args.theme.var.color.blue};
  border: 1px solid \${args.theme.var.color.blue};
  border-radius: 4px;
}\`;`}
            onClick={stop}
            type="button"
          >
            Stop
          </As>
        </As>
      )}

      {error() && (
        <As
          as="div"
          css={`return \`._id {
  margin-top: 4px;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  color: \${args.theme.var.color.red};
}\`;`}
          >
            An error occurred.
          </As>
          <As
            as="button"
            css={`return \`._id {
  padding: 4px;
  margin-top: 4px;
  color: \${args.theme.var.color.blue};
  border: 1px solid \${args.theme.var.color.blue};
  border-radius: 4px;
}\`;`}
            onClick={() => reload()}
            type="button"
          >
            Retry
          </As>
        </As>
      )}

      <As
        as="form"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: fixed;
  bottom: 0;
  padding:   2px;
  width: 100%;
  background-color: \${args.theme.var.color.white};
}\`;`}
        onSubmit={onSend}
      >
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  flex-direction: row;
  gap: 2px;
  fixed;
  right: 2px;
  bottom: 14px;
  align-items: end;
}\`;`}
        >
          <For each={files() ? Array.from(files()!) : []}>
            {(attachment) => {
              const type = attachment.type;
              return type.startsWith("image/") ? (
                <div>
                  <As
                    as="img"
                    alt={attachment.name}
                    css={`return \`._id {
  width: 24px;
  border-radius: 4px;
}\`;`}
                    src={URL.createObjectURL(attachment)}
                  />
                  <As
                    as="span"
                    css={`return \`._id {
  font-size: 12px;
  color: \${args.theme.var.color.gray};
}\`;`}
                  >
                    {attachment.name}
                  </As>
                </div>
              ) : type.startsWith("text/") ? (
                <As
                  as="div"
                  css={`return \`._id {
  width: 24px;
  color: \${args.theme.var.color.gray};
  flex-shrink: 0;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}\`;`}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  width: 16px;
  height: 20px;
  background-color: \${args.theme.var.color.gray_light_200};
  border-radius: 4px;
}\`;`}
                  />
                  {attachment.name}
                </As>
              ) : null;
            }}
          </For>
        </As>

        <input
          multiple
          onChange={(e) => setFiles(e.currentTarget.files ?? undefined)}
          ref={fileInputRef}
          type="file"
        />

        <As
          as="input"
          css={`return \`._id {
  background-color: \${args.theme.var.color.gray_light_200};
  width: 100%;
  padding: 2px;
}\`;`}
          disabled={isLoading()}
          onInput={handleInputChange}
          placeholder="Send message..."
          value={input()}
        />
      </As>
    </As>
  );
}
