import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";
import { Loader } from "~/components/Loader";

/**
 * A component that checks if the user is authenticated.
 * If not, it redirects to the login page with the current path as redirectUrl.
 * Otherwise, it renders its children.
 */
export function AuthRequired(props: ParentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const authData = createAsync(
    async () => {
      try {
        const userData = await getUserRPC();
        if (userData.error || !userData?.user) {
          const params = new URLSearchParams();
          params.set("redirectUrl", location.pathname);
          navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
            replace: true,
          });
        }
        return userData;
      } catch (_error) {
        const params = new URLSearchParams();
        params.set("redirectUrl", location.pathname);
        navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
          replace: true,
        });
        return null;
      }
    },
    { deferStream: true },
  );

  return (
    <Show
      when={authData()}
      fallback={<Loader message="Checking authentication..." />}
    >
      {props.children}
    </Show>
  );
}
