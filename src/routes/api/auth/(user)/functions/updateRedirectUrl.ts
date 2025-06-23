import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { API } from "~/lib/api/endpoints";
import type { Vertex } from "~/lib/graph/type/vertex";

export function updateRedirectUrl(
  user: Vertex,
  subDomain: string,
  redirectUrl?: null | string,
  queryParams?: URLSearchParams,
) {
  if (redirectUrl) {
    // Basic security check - ensure redirect URL is relative
    if (redirectUrl.startsWith("/")) {
      const finalUrl = new URL(redirectUrl, "http://dummy");

      // Add any existing query parameters from the original URL
      if (queryParams) {
        for (const [key, value] of queryParams.entries()) {
          finalUrl.searchParams.append(key, value);
        }
      }

      user.P.redirectUrl = `${finalUrl.pathname}${finalUrl.search}`;
      return;
    }
  }

  // Fall back to default redirect logic if no valid redirect URL provided
  user.P.redirectUrl =
    subDomain === ADMIN_DB_NAME
      ? API.urls.system.projects
      : API.urls.admin.root;
}
