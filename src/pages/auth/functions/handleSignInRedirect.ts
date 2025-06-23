import type { Navigator } from "@solidjs/router";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function handleSignInRedirect(
  value: Vertex,
  _graph: GraphInterface,
  navigate: Navigator,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirectUrl");

  if (redirectUrl) {
    navigate(redirectUrl);
  } else if (value != null && value.id !== null) {
    navigate(`${value.P.redirectUrl ?? ""}`);
  }
}
