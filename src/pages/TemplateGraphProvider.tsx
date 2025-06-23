import type { ParentProps } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import {
  // don't use
  createKeyedContext,
  useKeyedContext,
} from "@corvu/utils/create/keyedContext";

import { createAppState } from "~/createAppState";
import { GetInitialData } from "~/GetInitialData";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { GraphContext } from "~/lib/graph/context/GraphContext";

export const TemplateGraphProvider = (props: ParentProps) => {
  const graph = createAppState();
  mergeVertexProperties<GlobalProperties>(
    0,
    "globalStoreId",
    graph[0],
    graph[1],
    { url: "adminui" },
  );
  const TemplateGraph = createKeyedContext("templateGraph", graph);
  return (
    <TemplateGraph.Provider value={graph}>
      <GraphContext.Provider value={graph}>
        <GetInitialData authenticate={true}>{props.children}</GetInitialData>
      </GraphContext.Provider>
    </TemplateGraph.Provider>
  );
};

// Just for example, dont use it anywhere.
export function TemplateRenderer(props: { context?: any; name: string }) {
  const graph = useKeyedContext("templateGraph") as [
    GraphInterface,
    SetStoreFunction<GraphInterface>,
  ];
  return (
    <GraphContext.Provider value={graph}>
      <PageViewWrapper
        context={props.context}
        hideSaveCancelButton={true}
        isNoPermissionCheck={true}
        pageId={"new"}
        pageVertexName={props.name}
      />
    </GraphContext.Provider>
  );
}
