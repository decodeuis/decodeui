import type { Node, Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDriver } from "~/cypher/core/driver";
import { saveAllEmailTemplates } from "~/cypher/mutate/email/saveEmailTemplates";
import { addAdminRoleToUser } from "~/cypher/mutate/signup/admin/addAdminRoleToUser";
import { createDatabaseConstraints } from "~/cypher/mutate/signup/seed/createDatabaseConstraints";

import { createDatabase } from "./database/createDatabase";
import { createRootFolder } from "./seed/createRootFolder";
import { insertComponents } from "./seed/insertComponents";
import { createUserInUserDB } from "./user/createUserInDB";

export interface SubdomainRegisterRequestData {
  email: string;
  password: string;
  subDomain: string;
  username: string;
  uuid?: string;
}

export async function subdomainRegister(
  adminTx: Session | Transaction,
  data: SubdomainRegisterRequestData,
) {
  // validation is done on the parent function

  await createDatabase(data.subDomain);

  const query = "Match (u:User {uuid: $uuid}) RETURN u";
  const result = await adminTx.run(query, { uuid: data.uuid });
  const user = convertNodeToJson(result.records[0].get("u") as Node);

  const userDbSession = (await getDriver()).session({
    database: data.subDomain,
  });
  await createDatabaseConstraints(userDbSession);
  const tx = userDbSession.beginTransaction();

  try {
    await createUserInUserDB(
      tx,
      {
        email: data.email,
        emailConfirmed: true,
        username: data.username,
        uuid: user.P.uuid,
      },
      true,
    );

    await createRootFolder(tx);
    await addAdminRoleToUser(tx, user.P.uuid);

    await insertComponents(tx);

    // After successful subdomain creation and registration
    await saveAllEmailTemplates(tx);

    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }

  // syncNodesAPICall({
  //   // This is not syncing Root to child relationship.
  //   nodesToTransfer: ["Comp"], // "DataType", "Nav"
  //   subDomain: data.subDomain,
  // });
  await tx.close();
  await userDbSession.close();
  return user;
}
