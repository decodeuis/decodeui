import { PermissionLevel, type RoutePermission } from "./type/types";

// Define route permissions configuration
export const routePermissions: RoutePermission[] = [
  // Public routes - accessible to anyone
  { path: "/", requiredPermission: PermissionLevel.PUBLIC },
  { path: "/auth/*", requiredPermission: PermissionLevel.PUBLIC },
  { path: "/api/auth/*", requiredPermission: PermissionLevel.PUBLIC },
  { path: "/support/contact", requiredPermission: PermissionLevel.PUBLIC },
  {
    path: "/api/support/ticket/create",
    requiredPermission: PermissionLevel.PUBLIC,
  },
  {
    path: "/api/file/downloadCompanyRectangularLogo",
    requiredPermission: PermissionLevel.PUBLIC,
  },
  {
    path: "/api/file/downloadCompanySquareLogo",
    requiredPermission: PermissionLevel.PUBLIC,
  },
  { path: "/api/error/logError", requiredPermission: PermissionLevel.PUBLIC },
  { path: "/internal/*", requiredPermission: PermissionLevel.PUBLIC },

  // Authenticated routes - require signIn
  { path: "/dashboard", requiredPermission: PermissionLevel.AUTHENTICATED },
  { path: "/profile", requiredPermission: PermissionLevel.AUTHENTICATED },
  { path: "/settings", requiredPermission: PermissionLevel.AUTHENTICATED },
  { path: "/api/user/*", requiredPermission: PermissionLevel.AUTHENTICATED },

  // Admin routes - require admin privileges
  { path: "/admin/*", requiredPermission: PermissionLevel.ADMIN },
  { path: "/api/admin/*", requiredPermission: PermissionLevel.ADMIN },

  // System routes - require system admin privileges
  { path: "/system/*", requiredPermission: PermissionLevel.SYSTEM },
  { path: "/api/system/*", requiredPermission: PermissionLevel.SYSTEM },
  {
    path: "/api/setup/adminUserSetup",
    requiredPermission: PermissionLevel.PUBLIC,
  }, // Special case
  { path: "/*", requiredPermission: PermissionLevel.PUBLIC },

  // Example of custom permission check
  {
    customPermissionCheck: (_user, _path) => {
      // Example: Check if user has specific project access
      // In a real implementation, you might extract project ID from path
      // and check against user permissions
      // const projectId = path.split('/')[2];
      // return user.pathPermissions?.includes(`project:${projectId}`) || false;
      return false;
    },
    path: "/projects/*",
    requiredPermission: PermissionLevel.CUSTOM,
  },
];
