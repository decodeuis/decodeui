import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { csrf } from "shieldwall/start";

import { checkRoutePermissionBase } from "./lib/permissions/checkRoutePermission";

// https://docs.solidjs.com/solid-start/guides/security
// https://github.com/atilafassina/shieldwall
// Note: this authorization will not work in client side
export default createMiddleware({
  onRequest: [
    csrf,
    // temporary disable secureRequest
    // securityHeaders({
    //   csp: {
    //     dev: {
    //       value: {
    //         "connect-src": ["'self'", "ws://localhost:*", "https://api.iconify.design", "https://api.unisvg.com", "https://api.simplesvg.com"],
    //       }
    //     }
    //   }
    // }),
    // securityHeaders({
    //   referrerPolicy: "no-referrer", // Allows all iframes by not sending referrer information
    //   xFrameOptions: "SAMEORIGIN", // Allows iframes from the same origin
    // }),
    async (event) => {
      // Allow _server paths without permission check
      const url = new URL(event.request.url);
      if (url.pathname === "/_server") {
        return;
      }

      const permissionResult = await checkRoutePermissionBase(event.request);

      // If the user doesn't have permission, redirect to the appropriate page
      if (!permissionResult.hasPermission && permissionResult.redirectUrl) {
        return redirect(permissionResult.redirectUrl);
      }
    },
  ],
});
