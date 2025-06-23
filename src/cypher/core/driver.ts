import { auth, driver as createDriver } from "neo4j-driver";

import { boltPort } from "./boltConstant";

export async function getDriver() {
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "";

  return createDriver(
    `bolt://localhost:${boltPort}`,
    auth.basic(username, password),
    { disableLosslessIntegers: true }, // undefined
  );
}
