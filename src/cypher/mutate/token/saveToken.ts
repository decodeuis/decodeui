import type { Session, Transaction } from "neo4j-driver";

export async function saveToken(
  session: Session | Transaction,
  hashedToken: string,
  data: string,
): Promise<void> {
  const query = `
    CREATE (t:Token {
      hashedToken: $hashedToken,
      data: $data,
      createdAt: $createdAt,
      used: false
    })
  `;

  await session.run(query, {
    createdAt: Date.now(),
    data,
    hashedToken,
  });
}
