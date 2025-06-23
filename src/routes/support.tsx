import type { RouteSectionProps } from "@solidjs/router";

import { Link } from "@solidjs/meta";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";

import { useGraph } from "~/lib/graph/context/UseGraph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  const [graph] = useGraph();
  return (
    <>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </>
  );
}
