import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";

import { ModifyJsonMenu } from "./ModifyJsonMenu";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import type { Vertex } from "~/lib/graph/type/vertex";

export function ModifyJsonButton(props: {
  css?: string;
  item: Vertex;
  size: number;
}) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  return (
    <>
      <IconButton
        css={[
          ...ensureArray(props.css),
          `return \`._id {
  cursor: pointer;
  background-color: transparent;
  border: none;
}\`;`,
        ]}
        icon="ph:note-pencil"
        onClick={() => setShowModal(true)}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Modify JSON"
      />
      <Show when={showModal()}>
        <ModifyJsonMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        />
      </Show>
    </>
  );
}
