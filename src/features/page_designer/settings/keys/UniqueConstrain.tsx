import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { modifyFieldMetaAllFields } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/modifyFieldMetaAllFields";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { TablePanel } from "~/features/page_designer/settings/components/TablePanel";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function UniqueConstrains() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData.Page.attributes,
  ).find((meta) => meta.key === "Unique")!;
  modifyFieldMetaAllFields(
    uniqueConstrainsMetaAttribute.attributes!.find(
      (attribute) => attribute.key === "key",
    )!,
    graph,
    setGraph,
    formStoreVertex(),
    true,
  );
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

  return (
    <TablePanel
      title="Unique Constrains"
      icon="ph:prohibit"
      data={
        formStoreVertex()?.P.formDataId
          ? graph.vertexes[formStoreVertex().P.formDataId]
          : undefined
      }
      meta={graph.vertexes[metaVertexId]}
      addButtonAriaLabel="Add new unique constrain"
      isNoPermissionCheck={true}
      isRealTime={false}
    />
  );
}
