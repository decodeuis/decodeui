import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function isAdminRole(graph: GraphInterface) {
  return getGlobalStore(graph).P.userRoles?.some(
    (role) => graph.vertexes[role].P.key === "Admin",
  );
}
