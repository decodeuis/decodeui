import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { evalExpression } from "~/lib/expression_eval";

export function getConfiguredPermissions(
  currentUserRoleId: Id[],
  vertex: null | undefined | Vertex,
  graph: GraphInterface,
) {
  if (!vertex?.L) {
    return [];
  }
  const configuredPermissions: Vertex[] = [];
  const label = vertex.L[0];
  // RolePagePage
  const allRolePermissions: Vertex[] =
    evalExpression(label === "Attr" ? "->$0Perm" : "<-Role$0$0", {
      graph,
      setGraph: () => {},
      vertexes: [vertex],
    }) || [];
  for (const rp of allRolePermissions) {
    // RolePage
    const roles: Vertex[] =
      evalExpression(label === "Attr" ? "->$0Role" : `<-Role${label}`, {
        graph,
        setGraph: () => {},
        vertexes: [rp],
      }) || [];
    if (roles.some((r) => currentUserRoleId.includes(r.id))) {
      configuredPermissions.push(rp);
    }
  }
  return configuredPermissions;
}
