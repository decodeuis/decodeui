import type { Strategy } from "@floating-ui/dom";

import { getFloatingStyle } from "@corvu/utils/floating";
import { type Accessor, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import { ZIndex } from "~/components/fields/ZIndex";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { createFloating } from "~/lib/dom/createFloating";
import { createClickOutside } from "~/lib/hooks/createClickOutside";

import { AttrConfigPopOver } from "./AttrConfigPopOver";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function AttrConfigPopOverWrapper(
  props: Readonly<{
    isSelectedLayoutId: boolean;
    item: Vertex;
    reference: Accessor<HTMLElement | null>;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const strategy = () => "fixed" as Strategy;

  const floatingState = createFloating({
    enabled: true,
    floating: floating,
    options: () => ({
      flip: {
        padding: {
          bottom: 28,
          top: 28,
        },
        // this seems not working now
        // fallbackPlacements: ['top', 'top-end', 'bottom-start'],
      },
      offset: ({ placement }) => {
        return placement.startsWith("bottom") ? 30 : 1;
      },
      shift: {},
    }),
    placement: () => (props.isSelectedLayoutId ? "top-start" : "top-start"),
    reference: () => props.reference() ?? null,
    strategy,
  });

  createClickOutside(graph, setGraph, (event) => {
    const eventClickPath = event.composedPath();
    // this logic is working as expected
    if (
      !(
        eventClickPath.includes(floating()!) ||
        eventClickPath.includes(props.reference()!)
      )
    ) {
      const formStore = graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
      if (formStore?.P.selectedId !== -1) {
        mergeVertexProperties<FormStoreObject>(
          0,
          formStoreId!,
          graph,
          setGraph,
          {
            selectedId: -1,
          },
        );
      }
    }
  });
  return (
    <ZIndex>
      <Portal>
        <div
          ref={setFloating}
          style={{
            ...getFloatingStyle({
              floatingState: () => floatingState(),
              strategy: () => strategy(),
            })(),
            "z-index": 99999,
          }}
        >
          <AttrConfigPopOver item={props.item} />
        </div>
      </Portal>
    </ZIndex>
  );
}
