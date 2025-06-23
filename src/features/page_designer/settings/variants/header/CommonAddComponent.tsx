import { createSignal, type JSX, onMount } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { PROPERTIES } from "~/pages/settings/constants";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

export function CommonAddComponent(
  props: Readonly<{
    addNewState: (key: string) => void;
    children?: JSX.Element;
    label: string;
    onClose: (rowVertex?: Vertex) => void;
    placeholder: string;
    title: string;
  }>,
) {
  const [stateName, setStateName] = createSignal("");
  let inputRef: HTMLInputElement;

  onMount(() => inputRef?.focus());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      props.addNewState(stateName());
    }
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  display: flex;
  flex-direction: column;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 5px;
  padding-bottom: 5px;
}\`;`}
    >
      <span>{props.title}</span>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
  margin-top: 10px;
}\`;`}
      >
        <As
          as="label"
          css={`return \`._id {
  display: flex;
  flex-direction: column;
}\`;`}
        >
          {props.label}
          <As
            as="div"
            css={`return \`._id {
  align-items: center;
  display: flex;
}\`;`}
          >
            <As
              as="input"
              css={[
                PROPERTIES.Css.TextFieldCss,
                `return \`._id {
  height: 100%;
}\`;`,
              ]}
              onInput={(e) => setStateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={props.placeholder}
              ref={inputRef!}
              value={stateName()}
            />
          </As>
        </As>
        <IconButton
          icon="ic:round-check"
          iconCss={`return \`._id { margin-left: 2px; }\`;`}
          onClick={() => props.addNewState(stateName())}
          size={21}
        />
        {props.children}
      </As>
    </As>
  );
}
