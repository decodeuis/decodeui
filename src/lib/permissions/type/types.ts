// Permission types for URL access control
import type { SYSTEM_ROLES } from "~/cypher/permissions/type/types";

import type { Vertex } from "~/lib/graph/type/vertex";

// Define permission levels
export enum PermissionLevel {
  ADMIN = "ADMIN", // Requires admin privileges
  AUTHENTICATED = "AUTHENTICATED", // Requires any authenticated user
  CUSTOM = "CUSTOM", // Custom permission check
  PUBLIC = "PUBLIC", // Accessible to anyone
  SYSTEM = "SYSTEM", // Requires system admin privileges
}

// Type for permission check result
export interface PermissionCheckResult {
  hasPermission: boolean;
  message?: string;
  redirectUrl?: string;
  redirectLinkText?: string;
}

// Interface for route permission configuration
export interface RoutePermission {
  customPermissionCheck?: (user: UserWithPermissions, path: string) => boolean;
  path: string; // URL path pattern (can use wildcards like /admin/*)
  requiredPermission: PermissionLevel;
}

// Type for system roles
export type SystemRoleType = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

// Interface for user with permissions
export interface UserWithPermissions {
  roles: SystemRoleType[];
  user: Vertex;
}
