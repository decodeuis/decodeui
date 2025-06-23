import type { Session, Transaction } from "neo4j-driver";

import { createHash, randomBytes } from "node:crypto";

import { deleteExpiredTokens } from "~/cypher/mutate/token/deleteExpiredTokens";
import { getAndConsumeToken } from "~/cypher/mutate/token/getAndConsumeToken";
import { saveToken } from "~/cypher/mutate/token/saveToken";

const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function generateSecureToken(
  data: string,
  dbSession: Session | Transaction,
): Promise<string> {
  // Create a random token
  const randomToken = randomBytes(32).toString("hex");

  // Hash the token for storage
  const hashedToken = createHash("sha256").update(randomToken).digest("hex");

  // Store the token in database
  await saveToken(dbSession, hashedToken, data);

  // Clean up old tokens periodically
  await cleanupOldTokens(dbSession);

  return hashedToken;
}

export async function validateAndConsumeToken(
  hashedToken: string,
  dbSession: Session,
): Promise<null | string> {
  // const hashedToken = createHash("sha256").update(token).digest("hex");

  const tokenData = await getAndConsumeToken(dbSession, hashedToken);

  if (!tokenData) {
    return null;
  }

  // Check if token is expired
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY) {
    return null;
  }

  return tokenData.data;
}

async function cleanupOldTokens(
  dbSession: Session | Transaction,
): Promise<void> {
  await deleteExpiredTokens(dbSession, TOKEN_EXPIRY);
}
