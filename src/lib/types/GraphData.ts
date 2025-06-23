import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { Id } from "~/lib/graph/type/id";

export interface GraphData {
  deleted_edges?: string[];
  deleted_vertexes?: string[];
  edges: EdgeMap;
  timestamp?: number;
  vertexes: VertexMap;
  vertexLabelIdMap?: { [key: string]: Id[] };
}
