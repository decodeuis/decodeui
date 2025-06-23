import type { Session, Transaction } from "neo4j-driver";

import { getComponentTree } from "~/cypher/mutate/signup/seed/component_tree/getComponentTree";
import { insertComponentTree } from "~/cypher/mutate/signup/seed/component_tree/insertComonentTree";

export async function insertComponents(adminTx: Session | Transaction) {
  const response = await insertComponentTree(adminTx, getComponentTree());
  if (!response.success) {
    return response;
  }

  /* Now we not need this:
  const componentTree = {
    children: Object.keys(componentsMap).map((key) => ({
      children: [],
      Component: key,
    })),
    Component: "Root",
  };
  const response2 = await insertComponentTree(adminTx, [componentTree]);
  if (!response2.success) {
    return response2;
  }
  */

  return { success: true };
}
