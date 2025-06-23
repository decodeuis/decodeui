import type { Session, Transaction } from "neo4j-driver";

export async function doesNodeExist(
  txOrSession: Session | Transaction,
  label: string,
  attribute: string,
  value: string,
) {
  const query = `MATCH (n:${label} {${attribute}: $value}) RETURN n LIMIT 1`;
  const result = await txOrSession.run(query, { value });
  return result.records.length > 0;
}

export async function newAdminValidations(
  txOrSession: Session | Transaction,
  username: string,
  email: string,
) {
  if (
    username &&
    (await doesNodeExist(txOrSession, "User", "username", username))
  ) {
    throw new Error("Username already exists");
  }

  if (email && (await doesNodeExist(txOrSession, "User", "email", email))) {
    throw new Error("Email address already exists");
  }
}
