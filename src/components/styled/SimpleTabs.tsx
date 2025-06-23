import { For, type JSX, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";
import { As } from "../As";

export type TabItem = {
  id: string;
  label?: string;
  icon?: string | JSX.Element;
  [key: string]: string | JSX.Element | undefined;
};

export function TabsWithUnderline(
  props: Readonly<{
    displayValueKey?: string;
    onTabClick: (key: string) => void;
    selectedKey: string;
    tabs: TabItem[];
    iconSize?: number;
  }>,
) {
  const getOptionLabel = (option: TabItem) => {
    if (isObject(option) && props.displayValueKey) {
      if (props.displayValueKey.includes("::")) {
        return evalExpression(props.displayValueKey, option);
      }
      return option[props.displayValueKey];
    }

    return isObject(option) ? option.label : option;
  };

  // Inner component to handle icon rendering with Show
  const IconDisplay = (props: {
    icon?: string | JSX.Element;
    size?: number;
  }) => (
    <Show when={props.icon}>
      {(icon) =>
        typeof icon() === "string" ? (
          <Icon
            icon={icon() as string}
            height={props.size || 20}
            width={props.size || 20}
          />
        ) : (
          icon()
        )
      }
    </Show>
  );

  return (
    <As as="div">
      {/* Mobile view */}
      <As
        as="div"
        css={`return \`._id {
        @media (width >= 52.125rem) {
          display: none;
        }
      }\`;`}
      >
        <As
          as="label"
          css={`return \`._id {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }\`;`}
          for="tabs"
        >
          Select a tab
        </As>
        <As
          as="select"
          css={`return \`._id {
            line-height: 1.5rem;
            @media (width >= 52.125rem) {
              line-height: 1.25rem;
            }
            border-color: \${args.theme.var.color.border};
            &:focus {
              border-color: \${args.theme.var.color.primary};
            }
            border-radius: 0.375rem;
            display: block;
            &:focus {
              outline-offset: 2px;
              outline: 2px solid transparent;
            }
            padding-left: 0.75rem;
            padding-right: 2.5rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            width: 100%;
          }\`;`}
          id="tabs"
          onChange={(e) => props.onTabClick(e.currentTarget.value)}
          value={props.selectedKey}
        >
          <For each={props.tabs}>
            {(tab) => (
              <option selected={tab.id === props.selectedKey} value={tab.id}>
                {getOptionLabel(tab)}
              </option>
            )}
          </For>
        </As>
      </As>

      <As
        as="div"
        css={`return \`._id {
        display: none;
        @media (width >= 52.125rem) {
          display: block;
        }
      }\`;`}
      >
        <As
          as="div"
          css={`return \`._id {
          border-bottom-width: 1px;
          border-color: \${args.theme.var.color.border};
        }\`;`}
        >
          <As
            as="nav"
            aria-label="Tabs"
            css={`return \`._id {
            display: flex;
            gap: 0.5rem;
            margin-bottom: -1px;
          }\`;`}
          >
            <For each={props.tabs}>
              {(tab) => (
                <As
                  as="button"
                  aria-current={
                    tab.id === props.selectedKey ? "page" : undefined
                  }
                  css={[
                    `return \`._id {
                      line-height: 1.25rem;
                      background-color: transparent;
                      border-bottom-width: 2px;
                      border-left:none;
                      border-right:none;
                      border-top:none;
                      font-weight: 500;
                      padding: 0.5rem 0.25rem;
                      white-space: nowrap;
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                    }\`;`,
                    tab.id === props.selectedKey
                      ? `return \`._id {
                          border-color: \${args.theme.var.color.primary};
                          color: \${args.theme.var.color.primary_dark_200};
                        }\`;`
                      : `return \`._id {
                          border-color: transparent;
                          &:hover {
                            border-color: \${args.theme.var.color.background_light_400};
                            color: \${args.theme.var.color.primary_dark_400};
                          }
                          color: \${args.theme.var.color.primary};
                        }\`;`,
                  ]}
                  onClick={() => props.onTabClick(tab.id)}
                  type="button"
                >
                  <IconDisplay icon={tab.icon} size={props.iconSize} />
                  {getOptionLabel(tab)}
                </As>
              )}
            </For>
          </As>
        </As>
      </As>
    </As>
  );
}
