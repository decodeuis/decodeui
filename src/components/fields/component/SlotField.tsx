import { Show, useContext } from "solid-js";

import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import {HtmlField} from "~/components/fields/HtmlField";
/*
  - Array Structure: Each component wraps with all previous children components plus its own
  - Hierarchical Access: Slot names like "1footer" access the parent at level 1, "2footer" at level 2, etc.
  - Context Chain: Each component adds its Children function to the context array, creating a hierarchical chain
  - Backward Compatibility: Regular slot names (without numeric prefix) continue to work as before
  */
export const SlotField = (props: {class?: string}) => {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const meta = () => parentRenderContext()?.context?.meta;

  const slotComponents = useContext(SlotContext) || [];
  const SlotComponent = slotComponents[slotComponents.length - 1]; // Get the most recent (current) slot component

  return (
    <HtmlField {...props} as="slot" renderChildren={true}>
      <Show when={SlotComponent}>
        <SlotComponent slot={meta()?.P.slot} class={props.class}/>
      </Show>
    </HtmlField>
  );
};
