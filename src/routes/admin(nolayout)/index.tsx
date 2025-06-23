import type { JSX } from "solid-js";

import { Link } from "@solidjs/meta";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";
import AdminDashboard from "~/pages/admin_dashboard/Dashboard";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { EmailConfirmationBanner } from "~/components/notifications/EmailConfirmationBanner";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { AuthRequired } from "~/components/auth/AuthRequired";

export default function Admin() {
  return (
    <AdminLayoutRoute>
      <AdminDashboard />
    </AdminLayoutRoute>
  );
}

function AdminLayoutRoute(props: { children: JSX.Element }) {
  const [graph] = useGraph();
  return (
    <PermissionGuard>
      <AuthRequired>
        <Link href={getCompanySquareLogoUrl(graph) || ""} rel="icon" />
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
        <EmailConfirmationBanner />
        {props.children}
      </AuthRequired>
    </PermissionGuard>
  );
}
