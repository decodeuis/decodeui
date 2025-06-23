import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { generate401RedirectUrl } from "~/lib/api/endpoints";
import { findRoutePermission } from "~/lib/permissions/findRoutePermission";
import {
  type PermissionCheckResult,
  PermissionLevel,
  type SystemRoleType,
  type UserWithPermissions,
} from "~/lib/permissions/type/types";

/**
 * Maps system roles to permission levels they have access to
 */
const rolePermissionMap: Record<SystemRoleType, PermissionLevel[]> = {
  [SYSTEM_ROLES.ADMIN]: [
    PermissionLevel.PUBLIC,
    PermissionLevel.AUTHENTICATED,
    PermissionLevel.ADMIN,
  ],
  [SYSTEM_ROLES.GUEST]: [PermissionLevel.PUBLIC],
  [SYSTEM_ROLES.SYSTEM_ADMIN]: [
    PermissionLevel.PUBLIC,
    PermissionLevel.AUTHENTICATED,
    PermissionLevel.ADMIN,
    PermissionLevel.SYSTEM,
  ],
  [SYSTEM_ROLES.USER]: [PermissionLevel.PUBLIC, PermissionLevel.AUTHENTICATED],
};

/**
 * Validates if a user has permission to access a specific URL path based on their roles
 * @param user The user with permissions
 * @param path The URL path to check
 * @param isAdminSubDomain Whether the request is on the system subdomain
 * @returns Permission check result
 */
export function validateUrlAccess(
  user: undefined | UserWithPermissions,
  path: string,
  isAdminSubDomain = false,
): PermissionCheckResult {
  // Find the route permission configuration for this path
  const routePermission = findRoutePermission(path);

  // In Development Remove comment
  // Prevents access to admin routes when on system subdomain
  // if (isAdminSubDomain && (path === "/admin" || path.startsWith("/admin/"))) {
  //   return {
  //     hasPermission: false,
  //     message: "Admin routes are not accessible from the system subdomain",
  //   };
  // }

  // If no specific permission is defined, default to authenticated
  if (!routePermission) {
    const hasPermission = !!user;
    return {
      hasPermission,
      message: hasPermission ? undefined : "Authentication required",
      redirectUrl: hasPermission ? undefined : generate401RedirectUrl(path),
      redirectLinkText: hasPermission ? undefined : "Go to Sign In",
    };
  }

  // Handle public routes
  if (routePermission.requiredPermission === PermissionLevel.PUBLIC) {
    return { hasPermission: true };
  }

  // If no user, only public routes are accessible
  if (!user) {
    return {
      hasPermission: false,
      message: "Authentication required",
      redirectUrl: generate401RedirectUrl(path),
      redirectLinkText: "Go to Sign In",
    };
  }

  // For system routes, check if on system subdomain
  if (
    routePermission.requiredPermission === PermissionLevel.SYSTEM &&
    !isAdminSubDomain
  ) {
    return {
      hasPermission: false,
      message: "System routes must be accessed from the system subdomain",
    };
  }

  // Check custom permission if defined
  if (
    routePermission.requiredPermission === PermissionLevel.CUSTOM &&
    routePermission.customPermissionCheck
  ) {
    const hasCustomPermission = routePermission.customPermissionCheck(
      user,
      path,
    );
    return {
      hasPermission: hasCustomPermission,
      message: hasCustomPermission
        ? undefined
        : "You do not have permission to access this resource",
    };
  }

  // Check role-based permissions - user has permission if ANY of their roles has the required permission
  const hasPermission = user.roles.some((role) => {
    const permissionsForRole = rolePermissionMap[role] || [];
    return permissionsForRole.includes(routePermission.requiredPermission);
  });

  return {
    hasPermission,
    message: hasPermission
      ? undefined
      : "You do not have permission to access this resource",
  };
}
