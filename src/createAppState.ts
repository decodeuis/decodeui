import { createStore, type SetStoreFunction } from "solid-js/store";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import type { Id } from "~/lib/graph/type/id";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";
import { componentSchemas } from "~/components/fields/components";
import { getSchemasForSubdomain } from "~/page_schema/loader";

export function createAppState() {
  const graph = createGraph();

  addNewVertex(
    0,
    {
      id: "globalStoreId",
      IN: {},
      L: ["GlobalStore"],
      OUT: {},
      P: {
        activeClickOutside: [],
        initialDataFetchError: "",
        isDevelopment: false,
        newVertexId_: -500000,
        txnId_: 0,
        url: "",
        userRoles: [],
        userSettingId: "",
        tooltipRegistry: {},
        activeTooltips: {},
      } as GlobalProperties,
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "vertexOldIdToNewIdMap",
      IN: {},
      L: ["vertexOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "edgeOldIdToNewIdMap",
      IN: {},
      L: ["edgeOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );
  // Loop through all component schemas and process them into the graph
  for (const [key, schema] of Object.entries(componentSchemas)) {
    // Import and process each schema into the graph structure
    const importResult = importGraphStructure(schema, graph[0], graph[1]);
    processImportedGraph(
      importResult,
      graph[0],
      graph[1],
      "Component", // Parent label
      key, // Use the schema key as the parent key
    );
  }

  // Website schemas will be loaded after we get subdomain info from server
  // This is handled in loadWebsiteSchemasForSubdomain function

  return graph;
}

export function loadWebsiteSchemasForSubdomain(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  subdomain: string,
  domain?: string,
) {
  const schemas = getSchemasForSubdomain(subdomain, domain);

  // Check if we got all schemas (AllWebsiteSchemas) or specific website schemas (WebsiteSchemas)
  const isAllSchemas =
    "components" in schemas || "pages" in schemas ? false : true;

  if (isAllSchemas) {
    // Process all websites
    const allSchemas = schemas as Record<
      string,
      { components?: Record<string, any>; pages?: Record<string, any> }
    >;

    for (const [websiteName, websiteSchemas] of Object.entries(allSchemas)) {
      if (websiteSchemas.components) {
        for (const [componentKey, schema] of Object.entries(
          websiteSchemas.components,
        )) {
          const importResult = importGraphStructure(schema, graph, setGraph);
          processImportedGraph(
            importResult,
            graph,
            setGraph,
            "Component", // Parent label
            componentKey, // Use component key without prefix
          );
        }
      }

      // Process pages from all websites
      if (websiteSchemas.pages) {
        for (const [pageKey, schema] of Object.entries(websiteSchemas.pages)) {
          const importResult = importGraphStructure(schema, graph, setGraph);
          processImportedGraph(
            importResult,
            graph,
            setGraph,
            "Page", // Parent label for pages
            pageKey, // Use page key without prefix
          );
        }
      }
    }
  } else {
    // Process single website schemas
    const websiteSchemas = schemas as {
      components?: Record<string, any>;
      pages?: Record<string, any>;
    };

    if (websiteSchemas.components) {
      for (const [componentKey, schema] of Object.entries(
        websiteSchemas.components,
      )) {
        const importResult = importGraphStructure(schema, graph, setGraph);
        processImportedGraph(
          importResult,
          graph,
          setGraph,
          "Component", // Parent label
          componentKey, // Use component key without prefix
        );
      }
    }

    // Process pages from the specific website
    if (websiteSchemas.pages) {
      for (const [pageKey, schema] of Object.entries(websiteSchemas.pages)) {
        const importResult = importGraphStructure(schema, graph, setGraph);
        processImportedGraph(
          importResult,
          graph,
          setGraph,
          "Page", // Parent label for pages
          pageKey, // Use page key without prefix
        );
      }
    }
  }
}

export function createGraph() {
  return createStore<GraphInterface>({
    broadcastChannels: [],
    edges: {} as EdgeMap,
    vertexes: {} as VertexMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
  });
}
