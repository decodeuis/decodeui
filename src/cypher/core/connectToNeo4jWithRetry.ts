import neo4j, { type Driver } from "neo4j-driver";

// depricated
export async function connectToNeo4jWithRetry(
  uri: string,
  _username: string,
  _password: string,
  maxRetries = 5,
  initialDelay = 1000,
): Promise<Driver> {
  let retries = 0;
  const delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const driver = neo4j.driver(uri, undefined, {
        disableLosslessIntegers: true,
      });
      // Try to establish a connection by creating a dbSession and running a simple query
      const dbSession = driver.session();
      await dbSession.run("RETURN 1");
      await dbSession.close();
      return driver;
    } catch (error) {
      /*console.error(
        `Failed to connect to Neo4j (attempt ${retries + 1}):`,
        error,
      );*/
      retries += 1;
      if (retries >= maxRetries) {
        console.error("Max retries reached. Unable to connect to Neo4j.");
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      // delay *= 2; // Exponential backoff
    }
  }

  throw new Error("Unable to connect to Neo4j after max retries.");
}

/*
// Usage example
(async () => {
  const uri = 'bolt://localhost:7687';
  const username = 'neo4j';
  const password = 'password';

  try {
    const driver = await connectToNeo4jWithRetry(uri, username, password);
    // Use the driver for database operations

    // Remember to close the driver when done
    await driver.close();
  } catch (error) {
    console.error('Connection to Neo4j failed:', error);
  }
})();
*/
