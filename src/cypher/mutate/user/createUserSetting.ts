import type { Node, Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function createUserSetting(
  dbSession: Session,
  uuid: string,
): Promise<null | Vertex> {
  const createUserSettingQuery = `
      MATCH (u:User)
      WHERE u.uuid = $uuid
      CREATE (u)-[:UserSetting]->(s:UserSetting { createdAt: localDateTime() })
      RETURN s
    `;
  const createResult = await dbSession.run(createUserSettingQuery, {
    uuid: uuid,
  });
  return createResult.records.length > 0
    ? convertNodeToJson(createResult.records[0].get("s") as Node)
    : null;
}
