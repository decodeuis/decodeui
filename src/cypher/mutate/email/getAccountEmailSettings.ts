import type { Session } from "neo4j-driver";

export async function getAccountEmailSettings(
  dbSession: Session,
  accountId: string,
) {
  const result = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s as settings`,
    { accountId },
  );
  return result.records[0]?.get("settings") || null;
}
