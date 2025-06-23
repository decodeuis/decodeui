import type { Node, Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

import { createUserSetting } from "./createUserSetting";
import type { Vertex } from "~/lib/graph/type/vertex";

interface UserResult {
  // globalTheme: null | Vertex;
  profileImage: null | Vertex;
  roles: Vertex[];
  user: null | Vertex;
  userSetting: null | Vertex;
}

export async function findUserByEmailOrUuid(
  dbSession: Session,
  email?: null | string,
  uuid?: null | string,
): Promise<UserResult> {
  if (!(email || uuid)) {
    return getGuestOnlyResult(dbSession);
  }

  let query = `
    MATCH (u:User)
  `;

  if (uuid) {
    query += `
      WHERE u.uuid = $uuid
    `;
  } else if (email) {
    query += `
      WHERE u.email = $email OR u.username = $email
    `;
  }

  query += `
    OPTIONAL MATCH (u)-[:UserSetting]->(s:UserSetting)
    OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
    OPTIONAL MATCH (u)-[:UserProfileImage]->(p:File)
    RETURN u, s, collect(r) AS roles, p
  `;

  const result = await dbSession.run(query, { email, uuid });

  if (result.records.length === 0) {
    return getGuestOnlyResult(dbSession);
  }

  const record = result.records[0];
  const user = convertNodeToJson(record.get("u") as Node);
  const roles =
    (record.get("roles") as Node[] | null)?.map((role) =>
      convertNodeToJson(role),
    ) || [];
  let userSetting = record.get("s")
    ? convertNodeToJson(record.get("s") as Node)
    : null;
  const profileImage = record.get("p")
    ? convertNodeToJson(record.get("p") as Node)
    : null;

  if (user && !userSetting) {
    userSetting = (await createUserSetting(dbSession, user.P.uuid)) as Vertex;
  }

  return {
    profileImage,
    roles,
    user,
    userSetting,
  };
}

export async function findUserByEmailSimple(
  dbSession: Session,
  email: null | string,
): Promise<null | Vertex> {
  if (!email) {
    return null;
  }

  const query = `
    MATCH (u:User {email: $email})
    RETURN u
  `;

  const result = await dbSession.run(query, { email });

  if (result.records.length === 0) {
    return null;
  }

  return convertNodeToJson(result.records[0].get("u") as Node);
}

async function getGuestOnlyResult(dbSession: Session): Promise<UserResult> {
  const guestRole = await getGuestRole(dbSession);
  return {
    profileImage: null,
    roles: [guestRole],
    user: null,
    userSetting: null,
  };
}

async function getGuestRole(dbSession: Session): Promise<Vertex> {
  const guestQuery = `
    MATCH (r:Role {key: 'Guest'})
    RETURN r
  `;
  const guestResult = await dbSession.run(guestQuery);
  return convertNodeToJson(guestResult.records[0].get("r") as Node);
}
