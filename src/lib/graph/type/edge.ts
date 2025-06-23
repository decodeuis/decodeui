import type { Id } from "~/lib/graph/type/id";

export interface Edge {
  E: Id;
  id: Id;
  P: { [key: string]: any };
  S: Id;
  T: string;
}
