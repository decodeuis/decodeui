import { Show } from "solid-js";

import {
  FormContext,
  type FormStoreObject,
} from "~/components/form/context/FormContext";
import { PropertiesBody } from "~/features/page_designer/settings/properties/PropertiesBody";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PropertiesContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  return (
    <Show keyed when={formStoreVertex()?.id}>
      <Show
        when={
          formStoreVertex()?.P &&
          graph.vertexes[formStoreVertex()?.P.selectedId]
        }
      >
        <DesignerFormIdContext.Provider value={formStoreVertex().id}>
          <FormContext.Provider value={formStoreVertex().id}>
            <PropertiesBody />
          </FormContext.Provider>
        </DesignerFormIdContext.Provider>
      </Show>
    </Show>
  );
}
