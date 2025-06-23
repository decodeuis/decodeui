import type { Session, Transaction } from "neo4j-driver";

export async function deleteExpiredTokens(
  session: Session | Transaction,
  expiryTime: number,
): Promise<void> {
  const query = `
    MATCH (t:Token)
    WHERE t.createdAt < $expiryTime OR t.used = true
    DELETE t
  `;

  await session.run(query, {
    expiryTime: Date.now() - expiryTime,
  });
}
