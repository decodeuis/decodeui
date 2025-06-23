import type { Id } from "~/lib/graph/type/id";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export type InsertFn = {
  [key in InsertFnKey]?: string;
};

export type InsertFnKey =
  | "deleteEdge"
  | "deleteVertex"
  | "insert"
  | "insertEdge"
  | "merge"
  | "replace"
  | "replaceEdge";

export type TransactionValue = InsertFn & {
  data: Edge | Vertex;
  id: Id;
  originalData: Edge | Vertex;
};
