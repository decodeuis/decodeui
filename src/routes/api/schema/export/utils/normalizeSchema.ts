import type {
  ExportedSchema,
  ExportedVertex,
  ExportedEdge,
} from "~/routes/api/schema/ExportedSchema";

export function normalizeSchema(schema: ExportedSchema): ExportedSchema {
  // Create a map of old IDs to new sequential IDs
  const idMap = new Map<string, string>();
  let idCounter = 1;

  // First pass: map all vertex IDs
  schema.vertexes.forEach((vertex) => {
    idMap.set(vertex.id, String(idCounter++));
  });

  // Normalize vertices
  const normalizedVertexes: ExportedVertex[] = schema.vertexes.map(
    (vertex) => ({
      id: idMap.get(vertex.id)!,
      L: vertex.L,
      P: vertex.P,
    }),
  );

  // Normalize edges
  let edgeCounter = 1;
  const normalizedEdges: ExportedEdge[] = schema.edges.map((edge) => ({
    id: `e${edgeCounter++}`,
    T: edge.T,
    S: idMap.get(edge.S) || edge.S,
    E: idMap.get(edge.E) || edge.E,
    P: edge.P || {},
  }));

  return {
    vertexes: normalizedVertexes,
    edges: normalizedEdges,
  };
}
