export interface ExportedVertex {
  id: string;
  L: string | string[];
  P: Record<string, unknown>;
}

export interface ExportedEdge {
  id: string;
  T: string;
  S: string;
  E: string;
  P: Record<string, unknown>;
}

export interface ExportedSchema {
  vertexes: ExportedVertex[];
  edges: ExportedEdge[];
}
