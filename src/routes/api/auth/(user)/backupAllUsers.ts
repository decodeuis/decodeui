import type { APIEvent } from "@solidjs/start/server";
import type { Node, Relationship } from "neo4j-driver";

import { format } from "date-fns";
import { mkdirSync, writeFileSync } from "node:fs";

import { getDriver } from "~/cypher/core/driver";
import { getSubDomain } from "~/cypher/session/getSubDomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";

// deprecated
export async function GET({ request }: APIEvent) {
  // const { formName, formId } = await request.json();
  const { subdomain } = await getSubDomain(request.headers.get("host")!);

  try {
    return saveGraphToCypherQL();
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function saveGraphToCypherQL() {
  const subDomain = "default"; // Adjust this as needed
  const dbSession = (await getDriver()).session({ database: subDomain });

  try {
    const query = "MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m";
    const result = await dbSession.run(query);

    if (result.records.length === 0) {
      throw new APIError(
        "No nodes or relationships found in the database.",
        404,
      );
    }

    const nodes = new Set<Node>();
    const relationships = new Set<Relationship>();
    for (const record of result.records) {
      const node = record.get("n");
      const relationship = record.get("r");
      const relatedNode = record.get("m");

      if (node) {
        nodes.add(node);
      }
      if (relationship) {
        relationships.add(relationship);
      }
      if (relatedNode) {
        nodes.add(relatedNode);
      }
    }

    const timestamp = format(new Date(), "yyyyMMddHHmmss");
    const folderPath = `./cypherql_backups/${timestamp}`;
    mkdirSync(folderPath, { recursive: true });

    for (const node of nodes) {
      const nodeId = node.elementId;
      const nodeCypherQL = `CREATE (n${node.labels.length ? `:${node.labels.join(":")}` : ""} ${JSON.stringify(node.properties)})`;
      writeFileSync(`${folderPath}/node_${nodeId}.cypherql`, nodeCypherQL);
    }

    for (const relationship of relationships) {
      const relationshipId = relationship.elementId;
      const startNodeId = relationship.startNodeElementId;
      const endNodeId = relationship.endNodeElementId;
      const relationshipCypherQL = `MATCH (a), (b) WHERE elementId(a) = ${startNodeId} AND elementId(b) = ${endNodeId} CREATE (a)-[r:${relationship.type} ${JSON.stringify(relationship.properties)}]->(b)`;
      writeFileSync(
        `${folderPath}/relationship_${relationshipId}.cypherql`,
        relationshipCypherQL,
      );
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
