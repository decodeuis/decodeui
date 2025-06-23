import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { SaveAsTemplateMenu } from "../menus/SaveAsTemplateMenu";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";

interface SaveAsTemplateButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function SaveAsTemplateButton(
  props: Readonly<SaveAsTemplateButtonProps>,
) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  const [showTemplateMenu, setShowTemplateMenu] = createSignal(false);
  const [saveAsLabel, setSaveAsLabel] = createSignal<"Component" | "Template">(
    "Template",
  );

  const handleMenuSelect = (label: "Component" | "Template") => {
    setSaveAsLabel(label);
    setShowModal(false);
    setShowTemplateMenu(true);
  };

  return (
    <>
      <IconButton
        css={[
          ICON_BUTTON_STYLES.baseCss,
          ICON_BUTTON_STYLES.defaultCss,
          ...ensureArray(props.css),
          `return \`._id {
            background-color: transparent;
            border: none;
          }\`;`,
        ]}
        icon="ph:floppy-disk"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Save as Template"
      />
      <Show when={showModal()}>
        <DropdownMenu
          css={`return \`._id {
  padding: 0.50rem;
}\`;`}
          onClickOutside={() => setShowModal(false)}
          // onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        >
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}\`;`}
          >
            <As
              as="button"
              css={`return \`._id {
  text-align: left;
  padding-left: 1rem; padding-right: 1rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  /* hover: bg; */
}\`;`}
              onClick={() => handleMenuSelect("Template")}
            >
              Save as Template
            </As>
            <As
              as="button"
              css={`return \`._id {
  text-align: left;
  padding-left: 1rem; padding-right: 1rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  /* hover: bg; */
}\`;`}
              onClick={() => handleMenuSelect("Component")}
            >
              Save as Component
            </As>
          </As>
        </DropdownMenu>
      </Show>

      <Show when={showTemplateMenu()}>
        <SaveAsTemplateMenu
          item={props.item}
          // onMouseLeave={() => setShowTemplateMenu(false)}
          onClickOutside={() => setShowTemplateMenu(false)}
          onClose={() => setShowTemplateMenu(false)}
          parentRef={saveAsTemplateRef!}
          saveAsLabel={saveAsLabel()}
        />
      </Show>
    </>
  );
}
