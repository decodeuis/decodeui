import { useParams } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export default function PageHandler() {
  const params = useParams();
  const [graph] = useGraph();

  // Get the page path from the catch-all parameter
  const pagePath = createMemo(() => {
    const path = params.page;
    if (!path) return "/";
    return path.startsWith("/") ? path : `/${path}`; // .toLowerCase()
  });

  const pageVertex = createMemo(() => {
    return findVertexByLabelAndUniqueId(graph, "Page", "url", pagePath());
  });

  return (
    <Show when={pagePath()} keyed>
      <PageViewWrapper
        formMetaId={pageVertex()?.id}
        pageVertexName={"Page"}
        // pageKeyName={params.pageName}
        url={pagePath()}
      />
    </Show>
  );
}
