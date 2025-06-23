import { klona } from "klona";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { PermissionPanel } from "~/features/page_designer/settings/components/PermissionPanel";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function Permission() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const permissionsMetaAttribute = klona(
    FormMetaData[formStoreVertex()?.P.formId as keyof typeof FormMetaData]
      .attributes,
  ).find((meta) => meta.key === "PermGlobal");

  if (!permissionsMetaAttribute) {
    return <></>;
  }

  const { metaVertexId } = generateTableInputMeta(permissionsMetaAttribute);

  return (
    <PermissionPanel
      title="Permissions"
      data={
        formStoreVertex()?.P.formDataId
          ? graph.vertexes[formStoreVertex().P.formDataId]
          : undefined
      }
      meta={graph.vertexes[metaVertexId]}
      isNoPermissionCheck={true}
      isRealTime={false}
    />
  );
}
