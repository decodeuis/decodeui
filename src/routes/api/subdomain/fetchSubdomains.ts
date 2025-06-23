import type { Node, Record, Session } from "neo4j-driver";
import { processResult } from "~/cypher/conversion/processResult";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function fetchSubdomains(dbSession: Session, email: string) {
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};

  // Get subdomains through Account relationship
  const result = await dbSession.run(
    `
    MATCH (u:User {email: $email})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
    OPTIONAL MATCH (a:Activity)
    WHERE a.entityType = 'SubDomain' AND a.entityId = s.key
    WITH s, a
    ORDER BY a.timestamp DESC
    WITH s, collect(a)[0..5] as recentActivities
    RETURN s as subdomain, recentActivities
    ORDER BY s.createdAt DESC
  `,
    { email },
  );

  processResult(result.records, { nodes, relationships }, "subdomain", "");

  const subdomains = result.records.map((record: Record) => {
    const subdomainNode = convertNodeToJson(record.get("subdomain"));
    const activities = record.get("recentActivities")
      ? record
          .get("recentActivities")
          .map((activity: Node) => convertNodeToJson(activity))
      : [];

    return {
      ...subdomainNode,
      P: {
        ...subdomainNode.P,
        recentActivities: activities,
      },
    };
  });

  return {
    graph: {
      edges: relationships,
      vertexes: nodes,
    },
    result: subdomains,
    timestamp: new Date().getTime(),
  } as ServerResult;
}
