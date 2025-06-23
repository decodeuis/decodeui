import type { APIEvent } from "@solidjs/start/server";

import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/core/driver";
import { getSubDomain } from "~/cypher/session/getSubDomain";

// TODO: This should not throw error, else its not captured by the API error handler and sent to the client, or either handle erroor in API Endpoints.
export async function getDBSessionForSubdomain(request?: APIEvent["request"]) {
  const url = getURL(request);
  const subDomain = await determineSubDomain(url);
  const dbSession = (await getDriver()).session({
    database: subDomain.subdomain,
  });
  return {
    dbSession,
    domain: subDomain.domain,
    subDomain: subDomain.subdomain,
  };
}

export function getURL(request?: APIEvent["request"]): URL {
  const url = request ? new URL(request.url) : getRequestURL();
  if (!url) {
    throw new Error("URL is missing");
  }
  return url;
}

async function determineSubDomain(
  url: URL,
): Promise<{ domain: null | string; subdomain: string }> {
  const adminui = url.searchParams.get("adminui");
  return adminui === "true"
    ? { domain: null, subdomain: "adminui" }
    : await getSubDomain(url.hostname);
}
