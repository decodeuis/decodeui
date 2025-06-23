import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

// Not used in the system yet
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    if (subDomain !== ADMIN_DB_NAME) {
      throw new APIError(
        "Unauthorized. System subdomain access required.",
        403,
      );
    }
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { key } = await request.json();

    if (!key) {
      throw new APIError("Subdomain key required", 400);
    }

    // Get the user's account and verify subdomain access
    const accessResult = await getAccountAndSubdomain(
      dbSession,
      key,
      user.P.uuid,
    );

    if (accessResult.records.length === 0) {
      throw new APIError("Unauthorized access to subdomain", 403);
    }

    const account = accessResult.records[0].get("a");
    const subdomain = accessResult.records[0].get("s");

    // Delete the edge between Account and SubDomain
    await removeAccountSubdomainRelation(dbSession, account.properties.id, key);

    // Remove the SubDomain vertex
    await removeSubdomainNode(dbSession, key);

    await createActivityLog(
      dbSession,
      "subdomain_delete",
      "SubDomain",
      subdomain.elementId,
      user.P.email,
      `Deleted subdomain ${key}`,
    );

    return {
      graph: {
        deleted_vertexes: [subdomain.elementId],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function getAccountAndSubdomain(
  dbSession: Session,
  subDomainKey: string,
  userUuid: string,
) {
  const query = `
    MATCH (u:User {uuid: $userUuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain { key: $key })
    RETURN a, s
  `;
  return await dbSession.run(query, {
    key: subDomainKey,
    userUuid,
  });
}

async function removeAccountSubdomainRelation(
  dbSession: Session,
  accountId: string,
  subDomainKey: string,
) {
  const query = `
    MATCH (a:Account)-[r:AccountSubdomain]->(s:SubDomain { key: $key })
    WHERE a.id = $accountId
    DELETE r
  `;
  await dbSession.run(query, {
    accountId,
    key: subDomainKey,
  });
}

async function removeSubdomainNode(dbSession: Session, subDomainKey: string) {
  const query = `
    MATCH (s:SubDomain { key: $key })
    DELETE s
  `;
  await dbSession.run(query, { key: subDomainKey });
}
