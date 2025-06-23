import type { PermissionCheckResult } from "./type/types";

import { checkRoutePermissionBase } from "./checkRoutePermission";

/**
 * Common function to check if a user has permission to access a specific route
 * This can be used anywhere in the application, not just in middleware
 *
 * @param request The request object (optional)
 * @param path The path to check permissions for
 * @param host The host header value (optional, will use request host if not provided)
 * @returns A promise resolving to the permission check result
 */

export async function checkRoutePermission(
  request?: Request,
  path?: string,
  host?: string,
): Promise<PermissionCheckResult> {
  "use server";
  return checkRoutePermissionBase(request, path, host);
}
