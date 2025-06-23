import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { ImportMenu } from "../menus/ImportMenu";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";

interface ImportHtmlButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function ImportHtmlButton(props: Readonly<ImportHtmlButtonProps>) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
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
        icon="ph:arrow-square-down"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Import HTML"
      />
      <Show when={showModal()}>
        <ImportMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          // onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        />
      </Show>
    </>
  );
}
