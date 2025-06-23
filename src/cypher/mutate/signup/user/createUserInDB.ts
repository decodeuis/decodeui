import type { Session, Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { hashPassword } from "~/lib/auth/password";

import type { Vertex } from "~/lib/graph/type/vertex";

// Common interfaces
interface BaseUserData {
  email: string;
  emailConfirmed?: boolean;
  username: string;
}

interface UserDataWithPassword extends BaseUserData {
  password?: string;
}

/**
 * Create a user in the admin database
 */
export async function createUserInAdminDB(
  adminTx: Session | Transaction,
  userData: UserDataWithPassword,
): Promise<Vertex> {
  const uuid = uuidv7();
  const { hashedPassword, processedData, salt } =
    await processUserData(userData);

  const createUserParams = {
    ...processedData,
    hashedPassword,
    salt,
    uuid,
  };

  return executeUserCreationQuery(
    adminTx,
    buildUserCreationQuery("AdminDB"),
    createUserParams,
    "AdminDB",
  );
}

/**
 * Create a user in the user database
 */
export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: Record<string, unknown> & UserDataWithPassword,
  isAdminUser?: boolean,
): Promise<Vertex> {
  const uuid = (params.uuid as string) || uuidv7();
  const { hashedPassword, processedData, salt } = await processUserData(
    params,
    isAdminUser,
  );

  const queryParams = {
    ...processedData,
    hashedPassword,
    salt,
    uuid,
  };

  return executeUserCreationQuery(
    sessionOrTx,
    buildUserCreationQuery("UserDB"),
    queryParams,
    "UserDB",
  );
}

/**
 * Build a Neo4j query for user creation
 * @param dbType The type of database (AdminDB or UserDB)
 * @param additionalFields Additional fields to include in the query
 */
function buildUserCreationQuery(
  _dbType: "AdminDB" | "UserDB",
  additionalFields: Record<string, boolean> = {},
): string {
  // Start with the common fields all user creations need
  const baseFields = [
    "username: $username",
    "uuid: $uuid",
    "email: $email",
    "password: $hashedPassword",
    "salt: $salt",
    "emailConfirmed: $emailConfirmed",
  ];

  // Add database-specific fields or conditionally include fields
  const dbSpecificFields: string[] = [];

  // Add any additional custom fields defined in additionalFields
  Object.entries(additionalFields).forEach(([field, include]) => {
    if (include) {
      dbSpecificFields.push(`${field}: $${field}`);
    }
  });

  // Combine all fields
  const allFields = [...baseFields, ...dbSpecificFields];

  // Build and return the query
  return `
    CREATE (u:User {
      ${allFields.join(",\n      ")}
    }) 
    SET u.createdAt = localDateTime() 
    RETURN u;
  `;
}

/**
 * Common function to execute a Neo4j user creation query
 */
async function executeUserCreationQuery(
  sessionOrTx: Session | Transaction,
  query: string,
  params: Record<string, unknown>,
  dbName: string,
): Promise<Vertex> {
  try {
    const result = await sessionOrTx.run(query, params);
    const userNode = result.records[0]?.get("u");

    if (!userNode) {
      throw new Error(`Failed to create user in ${dbName}`);
    }

    // Convert to unknown first, then to the expected type
    return convertNodeToJson(userNode);
  } catch (error) {
    console.error(`Error creating user in ${dbName}:`, error);
    throw error;
  }
}

/**
 * Process user data and hash password if needed
 */
async function processUserData(
  userData: UserDataWithPassword,
  isAdminUser?: boolean,
): Promise<{
  hashedPassword: null | string;
  processedData: Record<string, unknown>;
  salt: null | string;
}> {
  let hashedPassword = null;
  let salt = null;

  // Only hash password for non-system users
  if (userData.password && !isAdminUser) {
    const hashResult = await hashPassword(userData.password);
    hashedPassword = hashResult.hashedPassword;
    salt = hashResult.salt;
  }

  return {
    hashedPassword,
    processedData: {
      ...userData,
      emailConfirmed: userData.emailConfirmed ?? false,
    },
    salt,
  };
}
