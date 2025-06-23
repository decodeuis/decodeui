import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

/**
 * Checks if a user exists in the current database
 */
export async function checkUserExists(
  dbSession: Session,
  uuid: string,
): Promise<{ exists: boolean; user?: Vertex }> {
  try {
    const userExists = await dbSession.run(
      "MATCH (u:User) WHERE u.uuid = $uuid RETURN u;",
      { uuid },
    );

    if (userExists.records.length > 0) {
      const user = convertNodeToJson(userExists.records[0].get("u"));
      return { exists: true, user };
    }
    return { exists: false };
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return { exists: false };
  }
}
