import { klona } from "klona";

import { pageAttr } from "~/lib/meta/page/pageAttr";
import { PermissionPanel } from "~/features/page_designer/settings/components/PermissionPanel";

import { generateTableInputMeta } from "./functions/generateTableInputMeta";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface SelectPermissionFieldProps {
  meta: Vertex;
  selectedLayout: Vertex;
  txnId: number;
}

export function SelectPermissionField(props: SelectPermissionFieldProps) {
  const [graph] = useGraph();

  const metaAttribute = klona(pageAttr.find((meta) => meta.key === "Perm"));
  const { metaVertexId } = generateTableInputMeta(metaAttribute!);

  return (
    <PermissionPanel
      data={props.selectedLayout}
      meta={graph.vertexes[metaVertexId]}
      addNewButtonText="Add New Permission"
      isNoPermissionCheck={true}
      isRealTime={false}
    />
  );
}
