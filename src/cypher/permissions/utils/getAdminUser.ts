import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { checkUserExists } from "~/cypher/permissions/utils/checkUserExists";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

/**
 * Gets a user from the system if they are a system user for the given subdomain
 * Returns { exists: boolean, user?: Vertex } where exists indicates if the user is a system user
 */
export async function getAdminUser(
  uuid: string,
  subDomain: string,
  adminDbSession: Session,
): Promise<{ exists: boolean; user?: Vertex }> {
  // If subDomain is the system database, user is automatically a system user
  if (subDomain === ADMIN_DB_NAME) {
    // Use checkUserExists to get the user from the admin database
    return await checkUserExists(adminDbSession, uuid);
  }

  // Check if user exists in admin database with the same SubDomain
  try {
    // First, check if the user is associated with the subdomain
    const adminCheck = await adminDbSession.run(
      `MATCH (s:SubDomain {key: $subDomain})
      MATCH (a:Account)-[:AccountSubdomain]->(s)
      MATCH (a)-[:AccountUser]->(u:User {uuid: $uuid})
      RETURN u`,
      { uuid, subDomain },
    );

    if (adminCheck.records.length > 0) {
      const user = convertNodeToJson(adminCheck.records[0].get("u"));
      return { exists: true, user };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error checking user in admin database:", error);
    return { exists: false };
  }
}
