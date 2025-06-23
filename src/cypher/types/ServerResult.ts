import type { Id } from "~/lib/graph/type/id";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";

export interface GraphData {
  deleted_edges?: Id[];
  deleted_vertexes?: Id[];
  edges: EdgeMap;
  vertexes: VertexMap;
}

export interface ServerResult {
  error?: null | string;
  graph?: GraphData;
  result?: any; //Vertex[],
  message?: string;
  subdomain?: string;
  domain?: string | null;
}
