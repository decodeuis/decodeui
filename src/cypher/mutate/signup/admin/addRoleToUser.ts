import type { Session, Transaction } from "neo4j-driver";

export async function addRoleToUser(
  sessionOrTx: Session | Transaction,
  uuid: string,
  roleKey: string,
  roleName: string,
) {
  // First check if the role exists, create it if it doesn't
  const checkRoleQuery = `
    MERGE (r:Role {key: $roleKey})
    ON CREATE SET r.name = $roleName, r.createdAt = datetime()
    RETURN r
  `;

  await sessionOrTx.run(checkRoleQuery, { roleKey, roleName });

  // Then create the relationship
  const query = `
    MATCH (u:User {uuid: $uuid}), (r:Role {key: $roleKey})
    MERGE (u)-[:UserRole]->(r)
    RETURN u, r
  `;

  const params = { roleKey, uuid };

  try {
    const result = await sessionOrTx.run(query, params);

    if (result.records.length === 0) {
      throw new Error(
        `Failed to add ${roleKey} role to user with UUID: ${uuid}`,
      );
    }

    return result;
  } catch (error) {
    console.error(`Error adding ${roleKey} role to user:`, error);
    throw error;
  }
}
