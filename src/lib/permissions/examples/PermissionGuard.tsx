import { createAsync, useLocation } from "@solidjs/router";
import { type JSX, Show } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { ErrorMessage } from "~/components/ErrorMessage";

import { checkRoutePermission } from "../checkRoutePermissionRPC";

/**
 * Example of using the common permission check function in a component
 * This component checks if the user has permission to access a specific path
 * and renders content accordingly
 */
export function PermissionGuard(props: {
  children: JSX.Element;
  fallback?: JSX.Element;
  path?: string;
}) {
  const location = useLocation();

  // Path to check - use provided path or current location
  const pathToCheck = () => props.path || location.pathname;

  // Create a resource to check permissions
  const permissionResult = createAsync(
    async () => {
      // Check if the user has permission to access this path
      return await checkRoutePermission(undefined, pathToCheck());
    },
    { deferStream: true },
  ); // required for server side rendering

  return (
    <Show when={permissionResult()}>
      <Show
        fallback={
          <div>
            {props.fallback || (
              <ErrorMessage
                message={
                  permissionResult()?.message ||
                  "You don't have permission to access this content"
                }
                linkText={
                  permissionResult()?.redirectLinkText || "Go to Sign In"
                }
                linkUrl={
                  permissionResult()?.redirectUrl || API.urls.admin.signIn
                }
              />
            )}
          </div>
        }
        when={permissionResult()?.hasPermission}
      >
        {props.children}
      </Show>
    </Show>
  );
}
