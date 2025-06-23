// Helper function to get all subdomains for a user
import type { Session, Transaction } from "neo4j-driver";

export async function getSubdomainsForAccount(
  session: Session | Transaction,
  uuid: string,
) {
  const subDomainsResult = await session.run(
    `MATCH (u:User {uuid: $uuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
     RETURN s.key as subdomain`,
    { uuid },
  );

  return subDomainsResult.records.map((record) => record.get("subdomain"));
}
