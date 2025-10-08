import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { Page } from "~/lib/meta/page/Page";
import { TablePanel } from "~/features/page_designer/settings/components/TablePanel";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function LayoutTable() {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // Page.attributes is wrapped in a div, so we need to access the nested attributes
  const pageAttributes = Page.attributes?.[0]?.attributes || [];
  
  const layoutMetaAttribute = klona(
    pageAttributes,
  ).find((meta) => meta.key === "Layout");

  if (!layoutMetaAttribute) {
    console.error("Layout attribute not found in Page metadata");
    return null;
  }

  if (!layoutMetaAttribute.attributes) {
    console.error("Layout attribute found but has no attributes property", layoutMetaAttribute);
    return null;
  }

  const { metaVertexId } = generateTableInputMeta(
    layoutMetaAttribute,
  );

  return (
    <TablePanel
      title="Layout"
      icon="ph:layout"
      data={
        formStoreVertex()?.P.formDataId
          ? graph.vertexes[formStoreVertex().P.formDataId]
          : undefined
      }
      meta={graph.vertexes[metaVertexId]}
      addButtonAriaLabel="Add new layout component"
      isNoPermissionCheck={true}
      isRealTime={false}
    />
  );
}