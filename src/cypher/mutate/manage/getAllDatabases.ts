import { getDriver } from "~/cypher/core/driver";

/**
 * Gets a list of all databases in the Neo4j instance
 */

export async function getAllDatabases() {
  const driver = await getDriver();
  const systemDbSession = driver.session();
  try {
    const result = await systemDbSession.run("SHOW DATABASES");
    return result.records.map((record) => record.get("name"));
  } catch (error) {
    console.error("Error fetching databases:", error);
    throw error;
  } finally {
    await systemDbSession.close();
  }
}
