import { useParams } from "@solidjs/router";
import { createMemo } from "solid-js";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export default function PageShareView() {
  const params = useParams();
  const [graph] = useGraph();

  const entityVertex = createMemo(() => {
    if (!params.entityname || !params.entity) return undefined;
    if (params.entity !== "Page") {
      return;
    }
    return findVertexByLabelAndUniqueId(
      graph,
      params.entity,
      "key",
      params.entityname,
    );
  });

  return (
    <PageViewWrapper
      formMetaId={entityVertex()?.id}
      pageId={params.formId}
      pageKeyName={params.entityname}
      pageVertexName={params.entity}
    />
  );
}
