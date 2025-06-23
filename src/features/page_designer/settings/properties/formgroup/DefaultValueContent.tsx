import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";

import { useDesignerFormIdContext } from "../../../context/LayoutContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function DefaultValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <DynamicComponent
      componentName={props.selectedLayout.P.componentName}
      data={props.selectedLayout}
      isNoPermissionCheck={true}
      isRealTime={false}
      // Node: this meta is not component meta
      meta={props.meta}
      noLabel
      onChange={(data) => props.onChange(props.meta, data)}
      txnId={props.txnId}
    />
  );
}
