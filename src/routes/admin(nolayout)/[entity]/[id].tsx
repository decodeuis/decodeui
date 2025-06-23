import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";

import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";

import { useGraph } from "~/lib/graph/context/UseGraph";
import { AuthRequired } from "~/components/auth/AuthRequired";

export default function AdminLayoutRoute(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <AuthRequired>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </AuthRequired>
  );
}
