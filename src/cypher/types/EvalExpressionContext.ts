import type { Session, Transaction } from "neo4j-driver";

import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface EvalExpressionContext {
  dbSession?: Session;
  nodes?: { [key: string]: Vertex };
  relationships?: { [key: string]: Edge };
  tx?: Transaction;
  vertexes?: Vertex[];
}
