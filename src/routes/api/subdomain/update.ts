import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

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

    const { domain, id, key, status, description } = await request.json();

    if (!id) {
      throw new APIError("Subdomain key required", 400);
    }

    // Get the user's account and verify subdomain access
    const accessResult = await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
      WHERE elementId(s) = $subdomainId
      RETURN a, s
    `,
      {
        subdomainId: id,
        uuid: user.P.uuid,
      },
    );

    if (accessResult.records.length === 0) {
      throw new APIError("Unauthorized access to subdomain", 403);
    }

    await validateDomain(dbSession, id, domain);
    const updatedSubdomain = await updateSubdomain(
      dbSession,
      id,
      key,
      domain,
      status,
      description,
    );

    await createActivityLog(
      dbSession,
      "subdomain_update",
      "SubDomain",
      updatedSubdomain.id,
      user.P.email,
      `Updated subdomain ${key} with domain ${domain}${description ? ` and description "${description}"` : ""}`,
    );

    return {
      graph: {
        edges: {},
        vertexes: { [updatedSubdomain.id]: updatedSubdomain },
      },
      result: updatedSubdomain,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function updateSubdomain(
  dbSession: Session,
  id: string,
  key: string,
  domain?: string,
  status?: string,
  description?: string,
) {
  const result = await dbSession.run(
    `MATCH (s:SubDomain) where elementId(s) = $id
     SET s.domain = $domain,
     s.description = $description,
     s.status = $status,
     s.lastModified = datetime()
     RETURN s`,
    {
      id,
      key,
      domain: domain || "",
      description: description || "",
      status: status || "active",
    },
  );

  if (!result.records[0]) {
    throw new APIError("Subdomain not found", 404);
  }

  return convertNodeToJson(result.records[0].get("s"));
}

async function validateDomain(
  dbSession: Session,
  currentId: string,
  newDomain: string,
) {
  const existingDomain = await dbSession.run(
    `MATCH (s:SubDomain {domain: $domain})
     WHERE elementId(s) <> $currentId
     RETURN s`,
    { currentId, domain: newDomain },
  );

  if (existingDomain.records.length > 0) {
    throw new APIError("Domain name is already taken", 400);
  }
}
