import { parse } from "tldts";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";

export async function getSubDomain(host: string) {
  const result = parse(host);
  const { domain, subdomain, hostname } = result;

  if (hostname === "localhost") {
    return { domain, subdomain: "admin" };
  }

  const effectiveDomain = domain || hostname;
  const effectiveSubdomain = subdomain;

  if (effectiveSubdomain === "admin") {
    return { domain, subdomain: ADMIN_DB_NAME };
  }
  if (effectiveDomain === process.env.DOMAIN) {
    return { domain, subdomain: effectiveSubdomain || "www" };
  }

  // Otherwise look up the domain in SubDomain vertex
  const driver = await getDriver();
  const dbSession = driver.session({ database: ADMIN_DB_NAME });
  if (dbSession) {
    try {
      const query = `
        MATCH (s:SubDomain {domain: $domain})
        RETURN s.key as subdomain
      `;
      const result = await dbSession.run(query, { domain: effectiveDomain });

      if (result.records.length > 0) {
        return { domain, subdomain: result.records[0].get("subdomain") };
      }
    } catch (error) {
      console.error("Error looking up domain:", error, effectiveDomain);
      throw error;
    }
  }

  throw "Error looking up domain";
}
