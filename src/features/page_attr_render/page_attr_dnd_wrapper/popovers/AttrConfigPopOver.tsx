// import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { createSelector, Match, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";

import { HoverAttrConfigPopOver } from "./HoverAttrConfigPopOver";
import { SelectedAttrConfigPopOver } from "./SelectedAttrConfigPopOver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function AttrConfigPopOver(props: Readonly<{ item: Vertex }>) {
  const [graph] = useGraph();
  const contextData = useDataContext() || {};

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const isSelectedIndex = () =>
    formStoreVertex()?.P.selectedIndex === contextData.index ||
    formStoreVertex()?.P.selectedIndex === -1;

  let popoverRef: HTMLDivElement | undefined;
  // const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
  // const _visible = useVisibilityObserver(() => popoverRef);

  return (
    <div ref={popoverRef}>
      <div
      // classList={{ hide: !visible() }}
      >
        <Switch>
          <Match when={isSelectedLayoutId(props.item.id) && isSelectedIndex()}>
            <SelectedAttrConfigPopOver item={props.item} />
          </Match>
          <Match
            when={
              isSelectedHoverId(props.item.id) ||
              formStoreVertex()?.P.multiHighlight.includes(props.item.id) ||
              (isSelectedLayoutId(props.item.id) && !isSelectedIndex())
            }
          >
            <HoverAttrConfigPopOver item={props.item} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}
