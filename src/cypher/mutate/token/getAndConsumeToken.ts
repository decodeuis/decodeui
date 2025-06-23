import type { Session, Transaction } from "neo4j-driver";

import type { TokenData } from "~/cypher/mutate/token/type/TokenData";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";

export async function getAndConsumeToken(
  session: Session | Transaction,
  hashedToken: string,
): Promise<null | TokenData> {
  const query = `
    MATCH (t:Token {hashedToken: $hashedToken})
    SET t.used = true
    RETURN t
  `;

  const result = await session.run(query, { hashedToken });
  if (result.records.length === 0) {
    return null;
  }

  const token = convertNodeToJson(result.records[0].get("t"));
  return token.P as TokenData;
}
