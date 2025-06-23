import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { APIError } from "~/lib/api/server/apiErrorHandler";

export async function validateUserAndPermissions(
  request: Request,
  dbSession: Session,
): Promise<Vertex> {
  const user = await getUserFromSession(request);
  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);
  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  return user;
}
