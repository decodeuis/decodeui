import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { PreviewCSSMenu } from "../menus/PreviewCSSMenu";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";

interface PreviewCSSButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function PreviewCSSButton(props: Readonly<PreviewCSSButtonProps>) {
  let previewCSSRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  let timer: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timer = setTimeout(() => setShowModal(true), 500);
  };

  const handleMouseLeave = (event: MouseEvent) => {
    clearTimeout(timer);
    const relatedTarget = event.relatedTarget as Node;
    const floatingElement = floating();

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    if (
      !(
        previewCSSRef?.contains(relatedTarget) ||
        floatingElement?.contains(relatedTarget)
      )
    ) {
      setShowModal(false);
    }
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
        icon="ph:file-css"
        onClick={() => setShowModal(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={(el) => (previewCSSRef = el)}
        size={props.size}
        title="Preview CSS"
      />
      <Show when={showModal()}>
        <PreviewCSSMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={(event) => {
            if (
              previewCSSRef &&
              !previewCSSRef.contains(event.relatedTarget as Node)
            ) {
              setShowModal(false);
            }
          }}
          parentRef={previewCSSRef!}
          ref={setFloating}
        />
      </Show>
    </>
  );
}
