import { transferNodeTypes } from "~/cypher/mutate/sync/transferNodeTypes";

import { ADMIN_DB_NAME } from "../core/boltConstant";
import { getDriver } from "../core/driver";

// Main function to initiate the migration process.
export async function syncNodesAPICall(args: {
  nodesToTransfer: string[];
  subDomain: string;
}) {
  "use server";

  const nodesToTransfer = args.nodesToTransfer;
  const driver = await getDriver();
  const dbSessionSource = driver.session({ database: ADMIN_DB_NAME });
  const dbSessionTarget = driver.session({ database: args.subDomain });

  try {
    await transferNodeTypes(dbSessionSource, dbSessionTarget, nodesToTransfer);
    return {
      error: false,
      message: "Migration completed successfully.",
    };
  } catch (error) {
    console.error("Error migrating nodes:", error);
    return {
      error: "Error migrating nodes.",
    };
  } finally {
    await dbSessionSource.close();
    await dbSessionTarget.close();
  }
}
