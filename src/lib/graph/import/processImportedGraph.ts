import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { SetStoreFunction } from "solid-js/store";

interface ImportedGraphResult {
  metaTxnId: number;
  vertexIdMap: Map<string, string>;
  rootVertexIds: string[];
}

interface ProcessedGraphResult {
  metaTxnId: number;
  parentId: string;
  attrRootIds: string[];
  labelGroups: Map<string, string[]>;
}

/**
 * Process the result from importGraphStructure, creating a parent vertex and organizing the imported vertices
 *
 * @param importResult - The result from importGraphStructure
 * @param graph - The graph interface
 * @param setGraph - The graph setter function
 * @param parentLabel - Label for the parent vertex (default: "Page")
 * @param parentKey - Key for the parent vertex (default: "Page")
 * @returns Processed graph result with parent ID and organized vertex groups
 */
export function processImportedGraph(
  importResult: ImportedGraphResult,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  parentLabel = "Page",
  parentKey = "Page",
): ProcessedGraphResult {
  const { metaTxnId, rootVertexIds, vertexIdMap } = importResult;

  // First, check if ANY imported vertex (not just roots) has Label "Page", "Component", "Theme", or "Function"
  for (const [, newId] of vertexIdMap) {
    const vertex = graph.vertexes[newId];
    if (
      vertex &&
      (vertex.L.includes("Page") ||
        vertex.L.includes("Component") ||
        vertex.L.includes("Theme") ||
        vertex.L.includes("Function"))
    ) {
      // Found an existing Page/Component/Theme/Function, use it as the parent
      return {
        metaTxnId,
        parentId: newId,
        attrRootIds: [],
        labelGroups: new Map(),
      };
    }
  }

  // Create parent vertex
  const parentId = generateNewVertexId(graph, setGraph);
  const parentVertex = {
    id: parentId,
    IN: {},
    L: [parentLabel],
    OUT: {},
    P: {
      key: parentKey,
      fns: "return { enabled: () => true }",
      isNoPermissionCheck: true,
    },
  };

  addNewVertex(metaTxnId, parentVertex, graph, setGraph);

  // Filter root vertices with Label "Attr"
  const attrRootIds = rootVertexIds.filter((id) =>
    graph.vertexes[id].L.includes("Attr"),
  );

  // Link parent to Attr vertices
  if (attrRootIds.length > 0) {
    setSelectionValue(
      metaTxnId,
      graph.vertexes[parentId],
      graph,
      setGraph,
      { P: { type: "Attr" } } as unknown as Vertex,
      attrRootIds,
    );
  }

  // Find remaining root vertices (not Attr)
  const remainingRootIds = rootVertexIds.filter(
    (id) => !graph.vertexes[id].L.includes("Attr"),
  );

  // Group remaining vertices by their first label
  const labelGroups = new Map<string, string[]>();
  for (const id of remainingRootIds) {
    const label = graph.vertexes[id].L[0];
    if (!labelGroups.has(label)) {
      labelGroups.set(label, []);
    }
    labelGroups.get(label)!.push(id);
  }

  // Set selection for each label group
  for (const [label, ids] of labelGroups) {
    setSelectionValue(
      metaTxnId,
      graph.vertexes[parentId],
      graph,
      setGraph,
      { P: { type: label } } as unknown as Vertex,
      ids,
    );
  }

  return {
    metaTxnId,
    parentId,
    attrRootIds,
    labelGroups,
  };
}
