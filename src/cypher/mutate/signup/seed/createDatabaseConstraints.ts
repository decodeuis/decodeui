import type { Session } from "neo4j-driver";

export async function createDatabaseConstraints(session: Session) {
  const constraints = [
    // Role and Permission constraints
    `CREATE CONSTRAINT unique_permission IF NOT EXISTS
     FOR (p:Perm) REQUIRE p.key IS UNIQUE`,
    `CREATE CONSTRAINT unique_role IF NOT EXISTS
     FOR (r:Role) REQUIRE r.key IS UNIQUE`,

    `CREATE CONSTRAINT unique_comp IF NOT EXISTS
     FOR (c:Comp) REQUIRE c.key IS UNIQUE`,

    `CREATE CONSTRAINT unique_support_status IF NOT EXISTS
     FOR (s:SupportStatus) REQUIRE s.key IS UNIQUE`,

    `CREATE CONSTRAINT unique_global_setting IF NOT EXISTS
     FOR (g:GlobalSetting) REQUIRE g.key IS UNIQUE`,

    `CREATE CONSTRAINT unique_theme IF NOT EXISTS
     FOR (t:Theme) REQUIRE t.key IS UNIQUE`,

    `CREATE CONSTRAINT unique_file_name IF NOT EXISTS
     FOR (f:File) REQUIRE f.fileName IS UNIQUE`,
  ];

  try {
    for (const constraint of constraints) {
      await session.run(constraint);
    }
  } catch (error) {
    console.error("Error creating database constraints:", error);
    throw error;
  }
}

/*
Remember to add appropriate indexes to the Neo4j database for the Token nodes if you expect high volume:
CREATE INDEX token_hashed_token FOR (t:Token) ON (t.hashedToken);
*/
