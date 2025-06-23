import type { Session, Transaction } from "neo4j-driver";

import { addRoleToUser } from "./addRoleToUser";

export async function addAdminRoleToUser(
  sessionOrTx: Session | Transaction,
  uuid: string,
) {
  return addRoleToUser(sessionOrTx, uuid, "Admin", "Administrator");
}
