import type { Message } from "ai";

import {
  createSignal,
  For,
  type JSX,
  Match,
  Show,
  Switch,
  onMount,
} from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";
import { STYLES } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { MultiSelectField, type Option } from "~/components/styled/MultiSelect";
import { PromptsMenu } from "./PromptsMenu";

interface ChatInputProps {
  chatMessages: Message[];
  examplesButtonRef: HTMLButtonElement | undefined;
  fileInputRef: HTMLInputElement | undefined;
  files: () => FileList | undefined;
  input: () => string;
  isLoading: () => boolean;
  onClearMessages: () => void;
  onExampleClick: (example: string) => void;
  onExamplesToggle: (show: boolean) => void;
  onFilesChange: (files: FileList | undefined) => void;
  onInputChange: JSX.ChangeEventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement,
    Event
  >;
  onSubmit: (e: SubmitEvent, model: string) => void;
  showExamples: () => boolean;
}

export function ChatInput(props: ChatInputProps) {
  const [selectedModel, setSelectedModel] = createSignal<string>("gpt-4-turbo");

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onSubmit(e, selectedModel());
  };

  return (
    <As
      as="form"
      css={`return \`._id {
  background: \${args.theme.var.color.background_light_100};
  border-top: 1px solid \${args.theme.var.color.border};
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 0 0 8px 8px;
}\`;`}
      onSubmit={handleSubmit}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 12px;
}\`;`}
      >
        <ModelSelector
          isLoading={props.isLoading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <MessagesCount
          chatMessages={props.chatMessages}
          onClearMessages={props.onClearMessages}
        />
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  gap: 8px;
}\`;`}
        >
          <As
            as="textarea"
            css={`return \`._id {
  display: flex;
  padding: 12px;
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 8px;
  color: \${args.theme.var.color.text};
  min-height: 48px;
  resize: vertical;
  width: 100%;
  font-size: 14px;
  background: \${args.theme.var.color.background_light_100};
  transition: border-color 0.2s;
  
  &:focus {
    border-color: \${args.theme.var.color.primary};
    outline: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}\`;`}
            disabled={props.isLoading()}
            onChange={props.onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (
                  (e.metaKey || e.ctrlKey) &&
                  !props.isLoading() &&
                  (e.target as HTMLTextAreaElement).value.trim()
                ) {
                  (
                    props.onInputChange as JSX.EventHandler<
                      HTMLTextAreaElement,
                      Event
                    >
                  )(e);
                  handleSubmit(e as unknown as SubmitEvent);
                } else {
                  // Prevent form submission on regular Enter
                  e.stopPropagation();
                }
              }
            }}
            placeholder="Generate a page... (Press Cmd+Enter to submit)"
            value={props.input()}
          />
          <As
            as="div"
            css={`return \`._id {
              display: flex;
              gap: 8px;
            }\`;`}
          >
            <IconButton
              disabled={props.isLoading()}
              css={`return \`._id {
                background-color: transparent;
                border: none;
                transition: color 0.2s;
                color: \${args.theme.var.color.text_light_700};
                
                &:hover:not(:disabled) {
                  color: \${args.theme.var.color.text_light_500};
                }
              }\`;`}
              icon="ph:list"
              onClick={() => props.onExamplesToggle(!props.showExamples())}
              ref={props.examplesButtonRef}
              size={22}
              title="Show Examples"
            />
            <IconButton
              css={`return \`._id {
                background-color: transparent;
                border: none;
                cursor: pointer;
                transition: color 0.2s;
                color: \${args.theme.var.color.text_light_700};
                
                &:hover:not(:disabled) {
                  color: \${args.theme.var.color.text_light_500};
                }
              }\`;`}
              disabled={props.isLoading()}
              icon="ph:paper-plane-right"
              onClick={(e) => handleSubmit(e as unknown as SubmitEvent)}
              size={22}
              title="Submit"
              type="button"
            />
          </As>
        </As>
        <FileInput
          files={props.files}
          onFilesChange={props.onFilesChange}
          ref={props.fileInputRef}
        />
        <Show when={props.showExamples()}>
          <PromptsMenu
            examplesButtonRef={props.examplesButtonRef!}
            onClickOutside={() => props.onExamplesToggle(false)}
            onMouseLeave={() => props.onExamplesToggle(false)}
            onExampleClick={props.onExampleClick}
          />
        </Show>
      </As>
    </As>
  );
}

function FileInput(props: {
  files: () => FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  ref: HTMLInputElement | undefined;
}) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  gap: 8px;
}\`;`}
    >
      <IconButton
        css={`return \`._id {
          cursor: pointer;
          background-color: transparent;
          border: none;
          transition: color 0.2s;
          color: \${args.theme.var.color.text_dark_600};
          
          &:hover {
            color: \${args.theme.var.color.text_light_400};
          }
        }\`;`}
        icon="ph:paperclip"
        onClick={() => props.ref?.click()}
        size={22}
        title="Select File"
      />
      <As
        as="input"
        css={`return \`._id {
  display: none;
}\`;`}
        multiple
        onChange={(e) =>
          props.onFilesChange(e.currentTarget.files ?? undefined)
        }
        ref={props.ref}
        type="file"
      />
      <Show when={props.files()}>
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}\`;`}
        >
          <For each={Array.from(props.files()!)}>
            {(file) => (
              <As
                as="div"
                css={`return \`._id {
  position: relative;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
}\`;`}
              >
                <Switch
                  fallback={
                    <As
                      as="div"
                      css={`return \`._id {
  width: 54px;
  height: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: \${args.theme.var.color.background_light_100};
  border-radius: 6px;
  border: 1px solid \${args.theme.var.color.border};
  overflow: hidden;
}\`;`}
                    >
                      <As
                        as="span"
                        css={`return \`._id {
  font-size: 24px;
}\`;`}
                      >
                        📄
                      </As>
                    </As>
                  }
                >
                  <Match when={file.type.startsWith("image/")}>
                    <As
                      as="img"
                      alt={file.name}
                      css={`return \`._id {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("video/")}>
                    <As
                      as="video"
                      css={`return \`._id {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("audio/")}>
                    <As
                      as="div"
                      css={`return \`._id {
  width: 54px;
  height: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: \${args.theme.var.color.background_light_100};
  border-radius: 6px;
  border: 1px solid \${args.theme.var.color.border};
}\`;`}
                    >
                      <As
                        as="span"
                        css={`return \`._id {
  font-size: 24px;
}\`;`}
                      >
                        🎵
                      </As>
                    </As>
                  </Match>
                </Switch>
                <IconButton
                  icon="ph:x-circle"
                  css={`return \`._id {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background-color: \${args.theme.var.color.text_light_900};
                    color: \${args.theme.var.color.background_light_100};
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    &:hover {
                      background-color: \${args.theme.var.color.text_light_300};
                    }
                  }\`;`}
                  onClick={() => {
                    const currentFiles = props.files();
                    if (currentFiles) {
                      const newFileArray = Array.from(currentFiles).filter(
                        (f) => f !== file,
                      );

                      // Create a DataTransfer to convert the array back to FileList
                      if (newFileArray.length > 0) {
                        const dt = new DataTransfer();
                        newFileArray.forEach((file) => dt.items.add(file));
                        props.onFilesChange(dt.files);
                      } else {
                        props.onFilesChange(undefined);
                        if (props.ref) {
                          props.ref.value = "";
                        }
                      }
                    }
                  }}
                  size={14}
                  title="Remove file"
                />
              </As>
            )}
          </For>
        </As>
      </Show>
    </As>
  );
}

function MessagesCount(props: {
  chatMessages: Message[];
  onClearMessages: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  let deleteButtonRef: HTMLButtonElement;

  return (
    <Show when={props.chatMessages.length > 0}>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: \${args.theme.var.color.background_light_100};
  border-radius: 6px;
}\`;`}
      >
        <TooltipWrapper
          arrowCss={STYLES.tooltip.arrowCss}
          content={
            <As
              as="div"
              css={[
                STYLES.overflowCss,
                STYLES.tooltip.contentCss,
                `return \`._id {
  max-height: 600px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  padding: 12px;
  min-width: 400px;
  width: 400px;
}\`;`,
              ]}
            >
              <For each={props.chatMessages}>
                {(msg) => (
                  <>
                    <As
                      as="span"
                      css={`return \`._id {
  font-weight: bold;
  color: \${args.theme.var.color.background_light_400};
}\`;`}
                    >
                      {msg.role}:
                    </As>
                    <As
                      as="span"
                      css={`return \`._id {
  white-space: pre-wrap;
}\`;`}
                    >
                      {msg.content}
                    </As>
                  </>
                )}
              </For>
            </As>
          }
          triggerCss={`return \`._id {
            color: \${args.theme.var.color.text_light_200};
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
          }\`;`}
        >
          <As
            as="span"
            css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 6px;
}\`;`}
          >
            <As
              as="span"
              css={`return \`._id {
                font-size: 18px;
              }\`;`}
            >
              💬
            </As>
            <As
              as="span"
              css={`return \`._id {
                font-weight: 500;
              }\`;`}
            >
              {props.chatMessages.length}
            </As>
          </As>
        </TooltipWrapper>
        <IconButton
          css={`return \`._id {
            background-color: transparent;
            border: none;
            color: \${args.theme.var.color.text_light_900};
            
            &:hover {
              color: \${args.theme.var.color.text_light_300};
            }
          }\`;`}
          icon="ph:trash"
          onClick={() => setShowDeleteConfirm(true)}
          ref={deleteButtonRef!}
          size={18}
          title="Clear Messages"
        />
        <Show when={showDeleteConfirm()}>
          <DropdownMenu
            onClickOutside={() => setShowDeleteConfirm(false)}
            parentRef={deleteButtonRef!}
          >
            <As
              as="div"
              css={`return \`._id {
  padding: 12px;
  background: \${args.theme.var.color.background_light_100};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 280px;
}\`;`}
            >
              <As
                as="div"
                css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 10px;
}\`;`}
              >
                <As
                  as="div"
                  css={`return \`._id {
  padding: 4px;
  font-weight: 600;
  text-align: center;
}\`;`}
                >
                  Clear all messages?
                </As>
                <As
                  as="button"
                  css={`return \`._id {
  text-align: center;
  padding: 8px;
  background: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
  border-radius: 6px;
  transition: background 0.2s;
  border: none;
  font-weight: 500;
  
  &:hover {
    background: \${args.theme.var.color.error_light_200};
  }
}\`;`}
                  onClick={() => {
                    props.onClearMessages();
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, clear all
                </As>
                <As
                  as="button"
                  css={`return \`._id {
  text-align: center;
  padding: 8px;
  background: \${args.theme.var.color.background_light_100};
  border-radius: 6px;
  border: 1px solid \${args.theme.var.color.border};
  transition: background 0.2s;
  font-weight: 500;
  
  &:hover {
    background: \${args.theme.var.color.border};
  }
}\`;`}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </As>
              </As>
            </As>
          </DropdownMenu>
        </Show>
      </As>
    </Show>
  );
}

function ModelSelector(props: {
  isLoading: () => boolean;
  selectedModel: () => string;
  setSelectedModel: (model: string) => void;
}) {
  const [options, setOptions] = createSignal<Option[]>([]);
  const [loading, setLoading] = createSignal(true);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chat/models");
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();
      setOptions([data]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching models:", error);
      setLoading(false);
    }
  };

  // Fetch models on component mount
  onMount(() => {
    fetchModels();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelect = (newSelected: Option[], _value: Option) => {
    if (newSelected.length > 0) {
      const selected = newSelected[0];
      const modelId = typeof selected === "string" ? selected : selected.id;
      props.setSelectedModel(modelId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemove = (_newSelected: Option[], _value: Option) => {
    // No additional handling needed for single select
  };

  // Convert the selected model to an Option format for MultiSelectField
  const selectedValues = () => {
    const currentModel = props.selectedModel();
    if (!currentModel) {
      return [];
    }

    return [{ id: currentModel, label: currentModel }];
  };

  return (
    <MultiSelectField
      css={`return \`._id {
        min-width: 200px;
      }\`;`}
      childrenKey="children"
      optionValueKey="id"
      displayValueKey="label"
      isLoadingOptions={loading()}
      loadOptions={fetchModels}
      onRemove={handleRemove}
      onSelect={handleSelect}
      options={options()}
      placeholder="Select a model"
      selectedValues={selectedValues}
      selectionLimit={1}
      disable={props.isLoading()}
    />
  );
}
