import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/type/vertex";

export async function validateUniqueFields(
  session: Session,
  uuid: string,
  oldUser: Vertex,
  email?: string,
  username?: string,
) {
  if (email && email !== oldUser.P.email) {
    const emailExists = await validateField(session, "email", email, uuid);
    if (emailExists) {
      throw new Error("Email address already exists");
    }
  }

  if (username && username !== oldUser.P.username) {
    const usernameExists = await validateField(
      session,
      "username",
      username,
      uuid,
    );
    if (usernameExists) {
      throw new Error("Username already exists");
    }
  }
}

async function validateField(
  session: Session,
  field: string,
  value: string,
  uuid: string,
) {
  const exists = await session.run(
    `MATCH (u:User {${field}: $value}) WHERE u.uuid <> $uuid RETURN u;`,
    { uuid, value },
  );
  return exists.records.length > 0;
}
