import type { APIEvent } from "@solidjs/start/server";

import { redirect } from "@solidjs/router";

import { checkRoutePermission } from "../checkRoutePermissionRPC";

/**
 * Example of using the common permission check function in a route handler
 * This could be used in a route file like src/routes/admin/settings.tsx
 */
export async function routeHandler(event: APIEvent) {
  // Check if the user has permission to access this route
  const permissionResult = await checkRoutePermission(event.request);

  // If the user doesn't have permission, redirect to the appropriate page
  if (!permissionResult.hasPermission) {
    if (permissionResult.redirectUrl) {
      return redirect(permissionResult.redirectUrl);
    }

    // If no redirect URL is provided, return a 403 Forbidden response
    return new Response(
      JSON.stringify({
        error: "Forbidden",
        message:
          permissionResult.message ||
          "You don't have permission to access this resource",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 403,
      },
    );
  }

  // Continue with the route handler logic for authorized users
  return {
    data: {
      // Example data
      settings: [
        { id: 1, name: "Setting 1", value: "Value 1" },
        { id: 2, name: "Setting 2", value: "Value 2" },
      ],
    },
    // Your route data here
    success: true,
  };
}
