import { useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/context/GraphContext";

export function useGraph() {
  const graphStore = useContext(GraphContext)!;
  if (!graphStore) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return graphStore;
}
