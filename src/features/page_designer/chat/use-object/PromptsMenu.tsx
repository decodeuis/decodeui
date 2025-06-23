import { For } from "solid-js";

import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { As } from "~/components/As";
import { EXAMPLE_PROMPTS, type PromptGroup } from "./constants/EXAMPLE_PROMPTS";

interface PromptsMenuProps {
  examplesButtonRef: HTMLButtonElement;
  onClickOutside: () => void;
  onExampleClick: (example: string) => void;
  onMouseLeave: () => void;
}

export function PromptsMenu(props: PromptsMenuProps) {
  return (
    <DropdownMenu
      onClickOutside={props.onClickOutside}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.examplesButtonRef}
    >
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          max-height: 420px;
          overflow-y: auto;
          background: \${args.theme.var.color.background_light_100};
          border: 1px solid \${args.theme.var.color.border};
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          width: 420px;
          min-width: 420px;
          
          /* Custom scrollbar for better visibility */
          &::-webkit-scrollbar {
            width: 8px;
          }
          
          &::-webkit-scrollbar-track {
            background: \${args.theme.var.color.background_light_50};
            border-radius: 4px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: \${args.theme.var.color.border};
            border-radius: 4px;
            
            &:hover {
              background: \${args.theme.var.color.text_light_200};
            }
          }
        }\`;`}
      >
        <As
          as="div"
          css={`return \`._id {
            font-weight: 600;
            color: \${args.theme.var.color.text};
            font-size: 14px;
            padding-bottom: 8px;
            border-bottom: 1px solid \${args.theme.var.color.border};
            margin-bottom: 8px;
          }\`;`}
        >
          Prompt Examples
        </As>
        <For each={EXAMPLE_PROMPTS}>
          {(group: PromptGroup) => (
            <As
              as="div"
              css={`return \`._id {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 8px;
              }\`;`}
            >
              <As
                as="div"
                css={`return \`._id {
                  font-weight: 600;
                  color: \${args.theme.var.color.text_light_200};
                  font-size: 13px;
                  margin-top: 4px;
                }\`;`}
              >
                {group.title}
              </As>
              <For each={group.prompts}>
                {(example) => (
                  <As
                    as="button"
                    css={`return \`._id {
                      text-align: left;
                      padding: 10px 12px;
                      background: \${args.theme.var.color.background_light_50};
                      color: \${args.theme.var.color.text};
                      border-radius: 6px;
                      border: 1px solid \${args.theme.var.color.border};
                      transition: all 0.2s;
                      font-size: 13px;
                      width: 100%;
                      cursor: pointer;
                      
                      &:hover {
                        background: \${args.theme.var.color.primary_light_100};
                        color: \${args.theme.var.color.primary_light_100_text};
                        border-color: \${args.theme.var.color.primary_light_200};
                        transform: translateX(2px);
                      }
                      
                      &:active {
                        transform: translateX(0);
                      }
                    }\`;`}
                    onClick={() => props.onExampleClick(example)}
                    type="button"
                  >
                    {example}
                  </As>
                )}
              </For>
            </As>
          )}
        </For>
      </As>
    </DropdownMenu>
  );
}
