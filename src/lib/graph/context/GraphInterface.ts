import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { Id } from "~/lib/graph/type/id";

export interface GraphInterface {
  broadcastChannels: string[];
  edges: EdgeMap;
  vertexes: VertexMap;
  vertexLabelIdMap: { [key: string]: Id[] };
}
