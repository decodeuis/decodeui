import type { Transaction } from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

export async function retryTransaction(
  callback: (tx: Transaction) => Promise<any>,
  maxRetries: number,
): Promise<any> {
  let attempt = 0;
  do {
    const { dbSession } = await getDBSessionForSubdomain();
    const tx = dbSession.beginTransaction();
    try {
      return await callback(tx);
    } catch (error: any) {
      if (
        error.message.includes(
          "Cannot resolve conflicting transactions. You can retry this transaction when the conflicting transaction is finished",
        )
      ) {
        attempt++;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 1 second before retrying
        } else {
          // console.error('Max retries reached. Could not handle mutation object.');
          return {
            error: "Max retries reached. Could not handle mutation object.",
          };
        }
      } else {
        console.error("Failed to handle mutation object:", error);
        await tx.rollback();
        throw error;
      }
    } finally {
      await tx.close(); //  the transaction will be automatically rolled back if not commited.
      await dbSession.close();
    }
  } while (attempt < maxRetries);
}
