import { Show, useContext } from "solid-js";

import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

export const SlotField = () => {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const meta = () => parentRenderContext()?.context?.meta;

  const SlotComponent = useContext(SlotContext);

  return (
    <Show when={SlotComponent}>
      <SlotComponent slot={meta()?.P.slot} />
    </Show>
  );
};
