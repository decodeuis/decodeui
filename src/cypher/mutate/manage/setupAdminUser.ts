import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createDatabase } from "~/cypher/mutate/signup/database/createDatabase";
import { createDatabaseConstraints } from "~/cypher/mutate/signup/seed/createDatabaseConstraints";

import { signupAdmin } from "../signup/signupAdmin";
import { getAllDatabases } from "./getAllDatabases";
import { adminUserData } from "~/cypher/mutate/manage/adminUserData";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function setupAdminUser(): Promise<{
  error?: string;
  status: number;
  user?: null | Vertex;
}> {
  try {
    const databases = await getAllDatabases();
    const adminDatabaseExists = databases.includes(ADMIN_DB_NAME);

    if (adminDatabaseExists) {
      return { error: "Admin user already exists", status: 400, user: null };
    }

    // Check if password exists in adminUserData
    if (!adminUserData.password) {
      return {
        error: "Admin user password is required",
        status: 400,
        user: null,
      };
    }

    await createDatabase(ADMIN_DB_NAME);

    const driver = await getDriver();
    const dbSession = driver.session({ database: ADMIN_DB_NAME });
    await createDatabaseConstraints(dbSession);
    const tx = dbSession.beginTransaction();
    try {
      // Check if a user with the same username already exists
      const checkUserQuery = `
        MATCH (u:User { username: $username })
        RETURN u
      `;
      const checkUserResult = await tx.run(checkUserQuery, {
        username: adminUserData.username,
      });

      if (checkUserResult.records.length > 0) {
        return {
          error: "User with the same username already exists.",
          status: 400,
          user: null,
        };
      }

      const result = await signupAdmin(tx, adminUserData, true);

      await tx.commit();
      return { status: 200, user: result.user };
    } catch (error) {
      await tx.rollback();
      console.error(`Error creating ${ADMIN_DB_NAME} user:`, error);
      return {
        error: `Failed to create ${ADMIN_DB_NAME} user`,
        status: 500,
        user: null,
      };
    } finally {
      await tx.close();
      await dbSession.close();
    }
  } catch (error) {
    console.error(`Error setting up ${ADMIN_DB_NAME} user:`, error);
    return {
      error: `Failed to setup ${ADMIN_DB_NAME} user: ${(error as Error).message}`,
      status: 500,
      user: null,
    };
  }
}
