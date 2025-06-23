import { Link, Title } from "@solidjs/meta";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SubDomainGrid } from "~/pages/subdomain/SubDomainGrid";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { JSX } from "solid-js";
import { AuthRequired } from "~/components/auth/AuthRequired";

export default function Projects() {
  return (
    <SystemLayoutRoute>
      <Title>Projects</Title>
      <As as="header" css={SETTINGS_CONSTANTS.HEADER_MENU_CSS}>
        <As
          as="div"
          css={`return \`._id {
  flex: 1;
}\`;`}
        />
        <As
          as="div"
          css={`return \`._id {
  margin-left: auto;
  display: flex;
  gap: 4px;
}\`;`}
        >
          <UserDropdownMenuDisplay />
        </As>
      </As>

      <HeaderWithDescription
        css={`return \`._id {
  flex: 1;
}\`;`}
        description={
          <>
            Each project has a separate subdomain and database. Only
            administrators (users with <b>Admin</b> role) can create and manage
            projects.
            <br />
            Click on Subdomain Name or Custom Domain Name to sign in to that
            project in a new tab.
          </>
        }
        title="Projects"
      />

      <As
        as="div"
        css={`return \`._id {
  padding: 6px;
}\`;`}
      >
        <SubDomainGrid />
      </As>
    </SystemLayoutRoute>
  );
}

function SystemLayoutRoute(props: { children: JSX.Element }) {
  const [graph] = useGraph();
  return (
    <AuthRequired>
      <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
      {props.children}
    </AuthRequired>
  );
}
