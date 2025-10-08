import { Icon } from "@iconify-icon/solid";
import { mergeRefs, type Ref } from "@solid-primitives/refs";
import {
  createMemo,
  createSignal,
  For,
  getOwner,
  type JSX,
  runWithOwner,
  Show,
} from "solid-js";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";
import { STYLES } from "~/pages/settings/constants";

import { useZIndex, ZIndex } from "../fields/ZIndex";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./modal/DropdownMenu";
import { useToast } from "./modal/Toast";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";

export type Option =
  | string
  | Vertex
  | {
      children?: Option[];
      id: string;
      label: string;
      [key: string]: unknown;
    };

type MultiSelectFieldProps = Readonly<{
  childrenKey?: string;
  class?: string;
  css?: CssType;
  disable?: boolean;
  displayValueKey?: string;
  error?: string;
  isLoadingOptions?: boolean;
  loadOptions?: () => Promise<void>;
  onRemove: (newSelected: Option[], value: Option) => void;
  onSelect: (newSelected: Option[], value: Option) => void;
  options: Option[];
  optionValueKey?: string;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
  selectedValues: () => Option[];
  selectionLimit?: number;
}>;

const getOptionValue = (option: Option, optionValueKey?: string): unknown => {
  if (!isObject(option)) {
    return option;
  }
  if (optionValueKey) {
    return option[optionValueKey as keyof Option];
  }
  return (option as { id: string }).id;
};

export const getOptionLabel = (option: Option, displayValueKey?: string): unknown => {
  if (isObject(option) && displayValueKey) {
    if (displayValueKey.includes("::")) {
      return evalExpression(displayValueKey, option) || "";
    }
    return option[displayValueKey as keyof Option] || "";
  }
  return isObject(option)
    ? (option as { label?: string }).label || ""
    : option;
};

function SelectedTag(props: {
  tag: Option;
  displayValueKey?: string;
  renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
  onRemove: (value: Option) => void;
}) {
  return (
    <As
      as="div"
      css={`return \`._id {
  align-items: center;
  background-color: \${args.theme.var.color.primary};
  cursor: default;
  display: flex;
  font-size: 14px;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  color: \${args.theme.var.color.primary_text};
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}\`;`}
    >
      <As
        as="span"
        css={`return \`._id {
  white-space: nowrap;
}\`;`}
      >
        {props.renderLabel
          ? props.renderLabel(props.tag, true)
          : getOptionLabel(props.tag, props.displayValueKey)}
      </As>
      <IconButton
        icon="ph:x"
        css={`return \`._id {
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 50%;
    color: \${args.theme.var.color.primary_text};
    transition: all 0.2s ease;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }\`;`}
        onClick={(e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          return props.onRemove(props.tag);
        }}
        size={14}
      />
    </As>
  );
}

type SingleOptionProps = {
  option: Option;
  isSelected: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
  childrenKey: string;
  renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
  displayValueKey?: string;
  onSelect: (option: Option) => void;
  onToggleExpand: (option: Option) => void;
  hiddenOptions?: () => Set<Option>;
  optionValueKey?: string;
  selectedValues?: Option[];
};

function SingleOption(props: SingleOptionProps) {
  return (
    <Show
      fallback={
        <As
          as="div"
          css={`return \`._id {
  cursor: pointer;
  font-size: 14px;
  margin: 2px 3px;
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.2s ease;
  ${
    props.isSelected
      ? `background-color: \${args.theme.var.color.primary_light_200};
         color: \${args.theme.var.color.primary_light_200_text};`
      : ""
  }
  &:hover {
    background-color: \${args.theme.var.color.primary_light_200};
    color: \${args.theme.var.color.primary_light_200_text};
  }
}\`;`}
          onClick={() => props.onSelect(props.option)}
        >
          {props.renderLabel
            ? props.renderLabel(props.option, props.isSelected)
            : getOptionLabel(props.option, props.displayValueKey)}
        </As>
      }
      when={props.hasChildren}
    >
      <div>
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  gap: 2px;
  margin: 3px;
  padding: 8px;
  border-radius: 5px;
  ${props.isSelected ? `background-color: \${args.theme.var.color.primary_light_200};` : ""}
  &:hover {
    background-color: \${args.theme.var.color.primary_light_200};
  }
}\`;`}
          onClick={() => props.onToggleExpand(props.option)}
        >
          <Icon
            icon={
              props.isExpanded ? "ph:caret-down-bold" : "ph:caret-right-bold"
            }
            noobserver
          />
          <span>
            {props.renderLabel
              ? props.renderLabel(props.option, props.isSelected)
              : getOptionLabel(props.option, props.displayValueKey)}
          </span>
        </As>
        <Show when={props.isExpanded}>
          <As
            as="div"
            css={`return \`._id {
  padding-left: 20px;
}\`;`}
          >
            <For
              each={
                (props.option as Record<string, Option[]>)[props.childrenKey] ||
                []
              }
            >
              {(childOption) => (
                <OptionItem
                  option={childOption}
                  childrenKey={props.childrenKey}
                  displayValueKey={props.displayValueKey}
                  renderLabel={props.renderLabel}
                  isSelected={() => {
                    if (props.selectedValues && props.optionValueKey) {
                      return props.selectedValues.some(
                        (item) =>
                          getOptionValue(item, props.optionValueKey) ===
                          getOptionValue(childOption, props.optionValueKey),
                      );
                    }
                    return false;
                  }}
                  onSelect={props.onSelect}
                  onToggleExpand={props.onToggleExpand}
                  hiddenOptions={props.hiddenOptions || (() => new Set())}
                  optionValueKey={props.optionValueKey}
                  selectedValues={props.selectedValues}
                />
              )}
            </For>
          </As>
        </Show>
      </div>
    </Show>
  );
}

function OptionItem(props: {
  option: Option;
  childrenKey: string;
  displayValueKey?: string;
  renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
  isSelected: () => boolean;
  onSelect: (option: Option) => void;
  onToggleExpand: (option: Option) => void;
  hiddenOptions: () => Set<Option>;
  optionValueKey?: string;
  selectedValues?: Option[];
}) {
  const isExpanded = () => !props.hiddenOptions().has(props.option);
  const hasChildren = () => {
    const option = props.option as Record<string, unknown>;
    const children = option[props.childrenKey];
    return Array.isArray(children) && children.length > 0;
  };

  return (
    <SingleOption
      option={props.option}
      isSelected={props.isSelected()}
      hasChildren={hasChildren()}
      isExpanded={isExpanded()}
      childrenKey={props.childrenKey}
      renderLabel={props.renderLabel}
      displayValueKey={props.displayValueKey}
      onSelect={props.onSelect}
      onToggleExpand={props.onToggleExpand}
      hiddenOptions={props.hiddenOptions}
      optionValueKey={props.optionValueKey}
      selectedValues={props.selectedValues}
    />
  );
}

type OptionsListProps = {
  options: Option[];
  selectedValues: Option[];
  selectionLimit?: number;
  childrenKey: string;
  displayValueKey?: string;
  optionValueKey?: string;
  renderLabel?: (option: Option, isSelected: boolean) => JSX.Element;
  onSelect: (newSelected: Option[], value: Option) => void;
  onRemove: (newSelected: Option[], value: Option) => void;
  isLoadingOptions?: boolean;
  inputValue: string;
};

// Filter options based on input value
const filterOptions = (
  options: Option[],
  inputValue: string,
  displayValueKey?: string,
  childrenKey = "children",
): Option[] => {
  return options.filter((option): boolean => {
    if (!option) {
      return false;
    }
    if (!isObject(option)) {
      return String(option).toLowerCase().includes(inputValue.toLowerCase());
    }
    const label = String(getOptionLabel(option, displayValueKey)).toLowerCase();
    const matches = label.includes(inputValue.toLowerCase());

    const optionRecord = option as Record<string, unknown>;
    if (
      optionRecord[childrenKey] &&
      Array.isArray(optionRecord[childrenKey]) &&
      (optionRecord[childrenKey] as unknown[]).length > 0
    ) {
      const originalOptions = JSON.parse(
        JSON.stringify(optionRecord[childrenKey]),
      );
      const filteredChildren = filterOptions(
        optionRecord[childrenKey] as Option[],
        inputValue,
        displayValueKey,
        childrenKey,
      );

      if (matches && filteredChildren.length === 0) {
        // If the parent matches and no children match, include all children
        optionRecord[childrenKey] = originalOptions;
        return true;
      }
      // Otherwise, filter the children
      optionRecord[childrenKey] = filteredChildren;
      // Include the parent if it matches or any children match
      return matches || filteredChildren.length > 0;
    }

    // Return true if the parent matches and there are no children
    return matches;
  });
};

function OptionsList(props: OptionsListProps) {
  const zIndex = useZIndex();
  const [hiddenOptions, setHiddenOptions] = createSignal<Set<Option>>(
    new Set(),
  );
  const { showErrorToast } = useToast();
  const owner = getOwner();

  const isOptionSelected = (option: Option) => {
    return props.selectedValues.some(
      (item) =>
        getOptionValue(item, props.optionValueKey) ===
        getOptionValue(option, props.optionValueKey),
    );
  };

  const handleSelectChange = (option: Option) => {
    runWithOwner(owner, () => {
      const value = getOptionValue(option, props.optionValueKey);
      let newSelected: Option[];
      if (
        props.selectedValues.some(
          (item) => getOptionValue(item, props.optionValueKey) === value,
        )
      ) {
        newSelected = props.selectedValues.filter(
          (item) => getOptionValue(item, props.optionValueKey) !== value,
        );

        props.onRemove?.(newSelected, value as Option);
      } else {
        if (
          props.selectionLimit &&
          props.selectionLimit > 1 &&
          props.selectedValues.length >= props.selectionLimit
        ) {
          showErrorToast("Selection limit reached");
          return; // Exit if selection limit is reached
        }
        if (props.selectionLimit === 1) {
          newSelected = [option];
        } else {
          newSelected = [...props.selectedValues, option];
        }

        props.onSelect?.(newSelected, value as Option);
      }
    });
  };

  const toggleExpandOption = (option: Option) => {
    runWithOwner(owner, () => {
      const newHiddenOptions = new Set(hiddenOptions());
      if (newHiddenOptions.has(option)) {
        newHiddenOptions.delete(option);
      } else {
        newHiddenOptions.add(option);
      }
      setHiddenOptions(newHiddenOptions);
    });
  };

  const filteredOptions = createMemo(() => {
    return filterOptions(
      JSON.parse(JSON.stringify(props.options || [])),
      props.inputValue,
      props.displayValueKey,
      props.childrenKey,
    );
  });

  return (
    <As
      as="div"
      css={[
        STYLES.overflowCss,
        `return \`._id {
          border-radius: 8px;
          display: flex;
          background-color: \${args.theme.var.color.background_light_100};
          flex-direction: column;
          max-height: 250px;
          width: 100%;
          z-index: ${zIndex};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }\`;`,
      ]}
    >
      <Show
        fallback={
          <As
            as="div"
            css={`return \`._id {
  cursor: pointer;
  padding: 12px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: \${args.theme.var.color.text_light_200};
  font-style: italic;
}\`;`}
          >
            Loading...
          </As>
        }
        when={!props.isLoadingOptions}
      >
        <For
          each={filteredOptions()}
          fallback={
            <As
              as="div"
              css={`return \`._id {
  cursor: pointer;
  padding: 12px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: \${args.theme.var.color.text_light_200};
  font-style: italic;
}\`;`}
            >
              No item found{" "}
            </As>
          }
        >
          {(option) => (
            <OptionItem
              option={option}
              childrenKey={props.childrenKey}
              displayValueKey={props.displayValueKey}
              renderLabel={props.renderLabel}
              isSelected={() => isOptionSelected(option)}
              onSelect={handleSelectChange}
              onToggleExpand={toggleExpandOption}
              hiddenOptions={hiddenOptions}
              optionValueKey={props.optionValueKey}
              selectedValues={props.selectedValues}
            />
          )}
        </For>
      </Show>
    </As>
  );
}

export function MultiSelectField(props: MultiSelectFieldProps) {
  let inputRef: HTMLInputElement | undefined;
  let optionTimeout: NodeJS.Timeout | undefined;
  const owner = getOwner();

  const [isReFetchSelectedValues, setIsReFetchSelectedValues] = createSignal(1);

  // Define signals for managing state
  const selectedValue = createMemo(
    () =>
      (isReFetchSelectedValues() && props.selectedValues()) || ([] as Option[]),
  );

  const [inputValue, setInputValue] = createSignal("");
  const [dropdownVisible, setDropdownVisible] = createSignal(false);
  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  // Remove tag from selected values
  const handleRemoveTag = (option: Option) => {
    runWithOwner(owner, () => {
      const newSelected = selectedValue().filter(
        (item) => getOptionValue(item, props.optionValueKey) !== option,
      );

      props.onRemove?.(newSelected, option);
    });
  };

  const handleInputFocus = () => {
    runWithOwner(owner, () => {
      if (dropdownVisible()) {
        clearTimeout(optionTimeout);
      } else {
        setDropdownVisible(true);
        if (!props.isLoadingOptions) {
          props.loadOptions?.();
        }
      }
    });
  };

  return (
    <As
      as="div"
      css={[
        ensureArray(props.css),
        `return \`._id {
  border: 1px solid \${args.theme.var.color.border};
  padding: 0;
  border-radius: 6px;
  text-align: left;
  width: 100%;
  transition: all 0.2s ease;
  &:focus-within {
    border-color: \${args.theme.var.color.primary};
    box-shadow: 0 0 0 2px \${args.theme.var.color.primary_light_100};
  }
  ${props.error ? "border: 1px solid \\${args.theme.var.color.error};" : ""}
}\`;`,
      ]}
      ref={mergeRefs<HTMLDivElement>(props.ref, setReference)}
    >
      {/* Main grid container */}
      <As
        as="div"
        css={`return \`._id {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}\`;`}
      >
        {/* Tags and input area */}
        <As
          as="div"
          css={[
            props.selectionLimit !== 1
              ? `return \`._id {flex-wrap: wrap;}\`;`
              : "",
            `return \`._id {
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 3px 8px;
  width: 100%;
  min-height: 38px;
}\`;`,
          ]}
        >
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}\`;`}
          >
            <For each={selectedValue()}>
              {(tag) => (
                <SelectedTag
                  tag={tag}
                  displayValueKey={props.displayValueKey}
                  renderLabel={props.renderLabel}
                  onRemove={handleRemoveTag}
                />
              )}
            </For>
          </As>
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  align-items: center;
  flex: 1;
}\`;`}
          >
            <As
              as="input"
              auto-complete="off"
              css={[
                `return \`._id {
  ${props.selectionLimit === 1 && selectedValue().length === 1 ? "width: 100px;" : ""}
  ${props.selectionLimit !== 1 ? "min-width: 100px;" : ""}
  border: none;
  flex: 1;
  outline: none;
  padding: 5px;
  font-size: 14px;
  background: transparent;
  color: \${args.theme.var.color.text};
}\`;`,
              ]}
              data-lpignore="true"
              disabled={props.disable}
              onFocus={handleInputFocus}
              onInput={(e) => setInputValue(e.target.value)}
              placeholder={props.placeholder}
              ref={inputRef}
              type="text"
              value={inputValue()}
            />
          </As>
        </As>

        {/* Dropdown icon area */}
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8px;
}\`;`}
        >
          <As
            as={Icon}
            css={`return \`._id {
  color: \${args.theme.var.color.text};
  cursor: pointer;
  transition: transform 0.2s ease;
  transform: rotate(${dropdownVisible() ? "180deg" : "0deg"});
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
}\`;`}
            icon="ph:caret-down-bold"
            noobserver
            onClick={() => {
              const newState = !dropdownVisible();
              setDropdownVisible(newState);
              if (newState && !props.isLoadingOptions) {
                props.loadOptions?.();
              }
            }}
            width={20}
          />
        </As>
      </As>

      <Show when={props.error}>
        <As
          as="div"
          css={`return \`._id {
  color: \${args.theme.var.color.error};
  font-size: 12px;
  padding: 2px;
}\`;`}
        >
          {props.error}
        </As>
      </Show>

      <Show when={dropdownVisible()}>
        <ZIndex>
          <DropdownMenu
            css={`return \`._id {
  border-radius: 5px;
}\`;`}
            onClickOutside={() => setDropdownVisible(false)}
            parentRef={reference()!}
          >
            <OptionsList
              options={props.options}
              selectedValues={selectedValue()}
              selectionLimit={props.selectionLimit}
              childrenKey={props.childrenKey || "children"}
              displayValueKey={props.displayValueKey}
              optionValueKey={props.optionValueKey}
              renderLabel={props.renderLabel}
              onSelect={(newSelected, value) => {
                props.onSelect(newSelected, value);

                if (props.selectionLimit === 1) {
                  setDropdownVisible(false);
                }
                setInputValue(""); // Most times user wants to clear the input after selecting an option
                if (props.selectionLimit !== 1) {
                  // If we don't focus, options list will be closed
                  inputRef?.focus();
                }

                setIsReFetchSelectedValues((v) => v + 1);
              }}
              onRemove={props.onRemove}
              isLoadingOptions={props.isLoadingOptions}
              inputValue={inputValue()}
            />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </As>
  );
}
