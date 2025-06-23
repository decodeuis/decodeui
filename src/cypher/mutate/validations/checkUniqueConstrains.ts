import { evalExpressionAsync } from "~/lib/expression_eval";

import { isReservedKeyword } from "../../constants/reservedKeywords";
import { getDBSessionForSubdomain } from "../../session/getSessionForSubdomain";
import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function checkUniqueConstrains(vertex: Vertex) {
  "use server";
  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const label = vertex.L[0];
    const key = vertex.P.key;
    const url = vertex.P.url;
    const id = vertex.id;

    if (!key) {
      return { error: "Please configure the key first" };
    }
    if (isReservedKeyword(key)) {
      return {
        error: `The key "${key}" is a reserved word and cannot be used`,
      };
    }
    if (await doesNameExist(dbSession, label, key, id)) {
      return { error: "Provided key already exists" };
    }

    // Check URL validation for Page entities
    if (label === "Page") {
      if (!url) {
        return { error: "URL is required for Page" };
      }
      if (await doesUrlExist(dbSession, url, id)) {
        return { error: "Provided URL already exists" };
      }
    }

    const uniqueConstrains = await evalExpressionAsync(
      `g:'Page[${label}]'->$0Unique`,
      {},
    );
    if (!Array.isArray(uniqueConstrains)) {
      return { error: false };
    }

    for (const constraint of uniqueConstrains) {
      let keysToCheck: Vertex[] = [];

      // If constraint has a comma-separated key property, use it
      if (constraint.P.key) {
        keysToCheck = constraint.P.key
          .split(",")
          .map((k: string) => k.trim())
          .map(
            (keyName: string) =>
              ({
                id: "",
                L: [],
                P: { key: keyName },
                IN: {},
                OUT: {},
              }) as Vertex,
          );
      } else {
        // Otherwise fall back to the relationship lookup
        const keys = await evalExpressionAsync("->$0Key", {
          vertexes: [constraint],
        });
        if (keys.length > 0) {
          keysToCheck = keys;
        }
      }

      // Skip if no keys to check
      if (keysToCheck.length === 0) {
        continue;
      }

      // Check for constraint violation
      if (
        await doesUniqueConstraintExist(
          dbSession,
          label,
          id,
          keysToCheck,
          vertex,
        )
      ) {
        const keyNames = keysToCheck.map((k: Vertex) => k.P.key).join(", ");
        return { error: `Unique constraint ${keyNames} already exists` };
      }
    }

    return { error: false };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    await dbSession.close();
  }
}

async function doesNameExist(
  dbSession: Session,
  label: string,
  key: string,
  id?: string,
) {
  const query = `MATCH (v:${label}) WHERE v.key = $key ${id ? "AND elementId(v) <> $id" : ""} RETURN v`;
  const result = await dbSession.run(query, id ? { id, key } : { key });
  return result.records.length > 0;
}

async function doesUrlExist(dbSession: Session, url: string, id?: string) {
  const query = `MATCH (v:Page) WHERE v.url = $url ${id ? "AND elementId(v) <> $id" : ""} RETURN v`;
  const result = await dbSession.run(query, id ? { id, url } : { url });
  return result.records.length > 0;
}

async function doesUniqueConstraintExist(
  dbSession: Session,
  label: string,
  id: string | undefined,
  keys: Vertex[],
  vertex: Vertex,
) {
  const params: Record<string, string | undefined> = { id };
  let query = `MATCH (v:${label}) WHERE ${id ? "elementId(v) <> $id AND " : ""}`;

  for (const key of keys) {
    query += `v.${key.P.key} = $${key.P.key} AND `;
    params[key.P.key] = vertex.P[key.P.key];
  }

  query = query.slice(0, -5); // Remove the last ' AND '
  query += " RETURN v";

  const result = await dbSession.run(query, params);
  return result.records.length > 0;
}
