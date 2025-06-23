import type { Session, Transaction } from "neo4j-driver";

import type { EvalExpressionContext } from "../../types/EvalExpressionContext";

import { processResult } from "../../conversion/processResult";
import { getDBSessionForSubdomain } from "../../session/getSessionForSubdomain";
import { getLabelFilterSkipLimit } from "./getLabelFilterSkipLimit";
import { mongoToCypher } from "./mongoToCypher";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function evalGetRelatedNodes(
  vertexes: Vertex[],
  edgeType: string,
  context: EvalExpressionContext,
  relationType: "child" | "g" | "id" | "parent",
) {
  if (
    (relationType === "child" || relationType === "parent") &&
    (!vertexes || vertexes.length === 0)
  ) {
    return;
  }

  const dbSession = await getSession(context);

  const { params, query } = buildQuery(
    edgeType,
    vertexes,
    relationType,
    context,
  );

  if (!query) {
    return;
  }
  try {
    const result = await runQuery(dbSession, query, params, context.tx);
    if (params.allLabels) {
      return result.records.map((record) => record.get(0)[0]);
    }
    return processResult(
      result.records,
      context,
      "n",
      relationType === "parent" || relationType === "child" ? "r" : "",
      relationType === "parent",
    );
  } catch (error) {
    console.error(
      `Error fetching ${relationType} for vertex ${vertexes.map((v) => v.id).join(", ")}:`,
      query,
      error,
    );
    throw error;
  } finally {
    await closeSession(dbSession, context);
  }
}

function buildQuery(
  edgeType: string,
  vertexes: Vertex[],
  relationType: "child" | "g" | "id" | "parent",
  context: EvalExpressionContext,
) {
  const ids = vertexes.map((v) => v.id);
  let query = "";
  let params: undefined | { [key: string]: unknown };

  if (relationType === "child") {
    const type = getEdgeType(edgeType, vertexes);
    if (type === "*") {
      query = `
        MATCH (parent)-[r]->(n)
        WHERE elementId(parent) IN $ids
        RETURN r, n
      `;
    } else if (type.includes("|")) {
      query = `
        MATCH (parent)-[r]->(n)
        WHERE elementId(parent) IN $ids AND type(r) IN $types
        RETURN r, n
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (parent)-[r:${type}]->(n)
        WHERE elementId(parent) IN $ids
        RETURN r, n
      `;
    }
  } else if (relationType === "parent") {
    const type = getEdgeType(edgeType, vertexes);
    if (type.includes("|")) {
      query = `
        MATCH (n)-[r]->(child)
        WHERE elementId(child) IN $ids AND type(r) IN $types
        RETURN r, n
      `;
      params = { ids, types: type.split("|") };
    } else {
      query = `
        MATCH (n)-[r:${type}]->(child)
        WHERE elementId(child) IN $ids
        RETURN r, n
      `;
    }
  } else if (relationType === "g") {
    const label = edgeType;
    if (!label) {
      return { error: "label must be provided." };
    }
    if (label === "ALL_LABELS") {
      query = "MATCH (n) RETURN DISTINCT labels(n)";
      params = { allLabels: true };
    } else if (label === "ALL_ROOT_LEVEL_COMPONENTS") {
      query = `MATCH (n:Component)
WHERE NOT EXISTS {
  MATCH (n)-[:ParentComponent]->()
}
RETURN n`;
      params = {};
    } else {
      const {
        filter,
        label: newLabel,
        limit,
        skip,
      } = getLabelFilterSkipLimit(label, context);
      if (newLabel) {
        query = `MATCH (n:${newLabel})`;
        const { params: filterParams, query: whereClause } =
          mongoToCypher(filter);
        if (whereClause) {
          query += ` WHERE ${whereClause}`;
          params = { ...params, ...filterParams };
        }

        if (skip) {
          query += ` SKIP ${skip}`;
        }
        if (limit) {
          query += ` LIMIT ${limit}`;
        }
        query += " RETURN n";
      } else {
        params = {};
      }
    }
  } else if (relationType === "id") {
    const ids = edgeType.split(",").map((id) => id.trim());
    query = "MATCH (n) WHERE elementId(n) IN $ids RETURN n";
    params = { ids };
  }

  if (!params) {
    params = { ids };
  }

  return { params, query };
}

async function closeSession(
  dbSession: null | Session,
  context: EvalExpressionContext,
) {
  if (!context.dbSession && dbSession) {
    await dbSession.close();
  }
}

function getEdgeType(edgeType: string, vertexes: Vertex[]) {
  return edgeType.replaceAll("$0", vertexes[0].L[0]);
}

async function getSession(context: EvalExpressionContext) {
  if (context.tx) {
    return null;
  }
  return context.dbSession || (await getDBSessionForSubdomain()).dbSession;
}

async function runQuery(
  dbSession: null | Session,
  query: string,
  params: { [key: string]: unknown },
  tx?: Transaction,
) {
  if (tx) {
    return await tx.run(query, params);
  }
  return await dbSession!.run(query, params);
}

// typed-neo4j/src/db.ts
/*async function find<T extends Record<string, unknown>, V extends keyof VertexSchema>(
  label: V,
  props: V extends keyof VertexSchema
    ? Partial<VertexSchema[V]>
    : T = {} as V extends keyof VertexSchema ? Partial<VertexSchema[V]> : T,
  config: {
    limit?: number;
    skip?: number;
    order?: { [key in keyof T]?: "asc" | "desc" };
  } = {},
): Promise<(Vertex & (V extends keyof VertexSchema ? VertexSchema[V] : T))[]> {
  const keys = Object.keys(props);
  props = convert.neo4j(props);

  const results = await this.run(
    `MATCH (n:${String(label)} { ${keys
      .map((key) => `${key}: $${key}`)
      .join(", ")} }) RETURN n ${
      config.order
        ? `ORDER BY ${Object.entries(config.order)
            .map(([key, order]) => `n.${key} ${order}`)
            .join(", ")}`
        : ""
    } ${config.limit ? `LIMIT ${config.limit}` : ""} ${
      config.skip ? `SKIP ${config.skip}` : ""
    }`,
    props,
  );

  const items: Node[] = results.records.map((record) => record.get("n"));

  return items.map((item) => ({
    $id: item.elementId,
    ...item.properties,
  })) as (Vertex & (V extends keyof VertexSchema ? VertexSchema[V] : T))[];
}*/
