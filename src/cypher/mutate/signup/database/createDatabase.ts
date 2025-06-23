import type { Driver } from "neo4j-driver";

import { getDriver } from "~/cypher/core/driver";

export async function createDatabase(subdomain: string) {
  let neo4JDriver: Driver | undefined = undefined;
  try {
    // Create a new database with the subdomain name

    neo4JDriver = await getDriver();
    const session = neo4JDriver.session();
    await session.run(`CREATE DATABASE ${subdomain}`);
  } catch (error) {
    console.error(`Failed to create database ${subdomain}:`, error);
    throw error;
  } finally {
    // Remember to close the driver when done
    await neo4JDriver?.close();
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
