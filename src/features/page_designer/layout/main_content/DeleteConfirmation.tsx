import { Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ZIndex } from "~/components/fields/ZIndex";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { DeleteAttributeDialog } from "../DeleteRuleDialog";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function DeleteConfirmation() {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  return (
    <Show
      when={
        formStoreVertex()?.P.usedAttrsInUniqueConstraints.length > 0 ||
        formStoreVertex()?.P.usedAttrsInNameKeys.length > 0 ||
        formStoreVertex()?.P.shouldContainAtLeastOneForm
      }
    >
      <ZIndex>
        <DeleteAttributeDialog />
      </ZIndex>
    </Show>
  );
}
