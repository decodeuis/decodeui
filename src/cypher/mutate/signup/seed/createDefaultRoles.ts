import type { Session, Transaction } from "neo4j-driver";

export async function createDefaultRoles(tx: Session | Transaction) {
  const createRolesQuery = `
    MERGE (admin:Role {key: 'Admin'})
    MERGE (user:Role {key: 'User'})
    MERGE (guest:Role {key: 'Guest'})
  `;

  try {
    await tx.run(createRolesQuery);
  } catch (error) {
    console.error("Error creating default roles:", error);
    throw error;
  }
}
