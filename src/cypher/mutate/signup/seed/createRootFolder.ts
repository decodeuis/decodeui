import type { Session, Transaction } from "neo4j-driver";

import { createDefaultPermissions } from "~/cypher/mutate/signup/seed/createDefaultPermissions";
import { createDefaultRoles } from "~/cypher/mutate/signup/seed/createDefaultRoles";
import { createSupportStatus } from "~/cypher/mutate/signup/seed/createSupportStatus";
import { getDefaultTheme } from "~/lib/theme/getDefaultTheme";

export async function createRootFolder(
  tx: Session | Transaction,
): Promise<void> {
  try {
    const query = `
      MERGE (:Folder {key: 'Root'})
      MERGE (:Comp {key: 'Root'})
      MERGE (:Perm {key: 'Root'})
      MERGE (globalSetting:GlobalSetting {key: 'Default'})
      MERGE (theme:Theme {key: 'Default'})
      SET theme.data = $theme
      MERGE (globalSetting)-[:GlobalSettingTheme]->(theme)
    `;

    const params = {
      theme: getDefaultTheme(),
    };

    await tx.run(query, params);
    await createDefaultPermissions(tx);
    await createDefaultRoles(tx);
    await createSupportStatus(tx);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}
