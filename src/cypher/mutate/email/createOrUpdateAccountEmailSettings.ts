import type { Session } from "neo4j-driver";

import type { EmailSettings } from "~/cypher/mutate/email/type/EmailSettings";

export async function createOrUpdateAccountEmailSettings(
  dbSession: Session,
  accountId: string,
  settings: EmailSettings,
) {
  // First try to find existing EmailSetting
  const findResult = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s.key as key`,
    { accountId },
  );

  let settingsKey: string;

  if (findResult.records.length === 0) {
    // Create new EmailSetting if not found
    settingsKey = "Default";
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})
       CREATE (s:EmailSetting {
         key: $key,
         createdAt: datetime(),
         updatedAt: datetime()
       })
       CREATE (a)-[:AccountEmailSetting]->(s)
       SET s += $settings
       RETURN s.key as key`,
      { accountId, key: settingsKey, settings },
    );
  } else {
    // Update existing EmailSetting
    settingsKey = findResult.records[0].get("key");
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
       SET s += $settings,
           s.updatedAt = datetime()
       RETURN s.key as key`,
      { accountId, settings },
    );
  }

  return settingsKey;
}
