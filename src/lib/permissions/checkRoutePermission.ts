import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getUserPermissionsByUuid } from "~/cypher/permissions/getUserPermissionsByUuid";
import { getURL } from "~/cypher/session/getSessionForSubdomain";
import { getSubDomain } from "~/cypher/session/getSubDomain";
import { validateUrlAccess } from "~/lib/permissions/validateUrlAccess";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import type { PermissionCheckResult } from "./type/types";

// Note: either request or host must be provided
export async function checkRoutePermissionBase(
  request?: Request,
  path?: string,
  host?: string,
): Promise<PermissionCheckResult> {
  try {
    // If no path provided and request exists, extract path from request URL
    if (!path && request) {
      const url = new URL(request.url);
      path = url.pathname;
    }

    // If no path available, return access denied
    if (!path) {
      return {
        hasPermission: false,
        message: "No path specified for permission check",
      };
    }

    // Special case for setup endpoint
    if (path === "/api/setup/adminUserSetup") {
      return { hasPermission: true };
    }

    // Get subdomain information
    const hostValue = host || getURL(request).host || "";
    const { subdomain } = await getSubDomain(hostValue);
    const isAdminSubDomain = subdomain === ADMIN_DB_NAME;

    // Get user from session
    const sessionUser = await getUserFromSession(request);

    // Get user permissions by UUID if user exists
    let userWithPermissions;
    if (sessionUser?.P?.uuid) {
      userWithPermissions = await getUserPermissionsByUuid(
        sessionUser.P.uuid,
        request,
      );
    }

    // Validate if the user has permission to access this URL
    return validateUrlAccess(userWithPermissions, path, isAdminSubDomain);
  } catch (error) {
    console.error("Error checking route permission:", error);
    return {
      hasPermission: false,
      message: "Error checking permissions",
    };
  }
}
