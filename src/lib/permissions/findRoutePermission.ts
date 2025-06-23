import type { RoutePermission } from "~/lib/permissions/type/types";

import { routePermissions } from "~/lib/permissions/routePermissions";

// Helper function to find matching route permission for a given path
export function findRoutePermission(path: string): RoutePermission | undefined {
  // First try exact match
  const exactMatch = routePermissions.find((route) => route.path === path);
  if (exactMatch) {
    return exactMatch;
  }

  // Then try wildcard matches
  return routePermissions.find((route) => {
    if (route.path.endsWith("/*")) {
      const baseRoute = route.path.slice(0, -2);
      return path === baseRoute || path.startsWith(`${baseRoute}/`);
    }
    return false;
  });
}
