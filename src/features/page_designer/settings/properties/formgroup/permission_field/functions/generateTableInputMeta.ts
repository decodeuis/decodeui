import { onCleanup } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function generateTableInputMeta(metaAttribute: FieldAttribute) {
  const [graph, setGraph] = useGraph();
  const metaVertexId = generateNewVertexId(graph, setGraph);
  const metaTxnId = generateNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], metaAttribute),
    graph,
    setGraph,
  );
  if (metaAttribute.attributes) {
    addMetaVertexes(
      graph,
      setGraph,
      metaTxnId,
      graph.vertexes[metaVertexId],
      metaAttribute.attributes,
    );
  }
  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return { metaVertexId };
}
