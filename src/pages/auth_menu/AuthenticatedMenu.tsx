import type { JSX } from "solid-js";
import { For } from "solid-js";

import { Icon } from "@iconify-icon/solid";
import { useNavigate, useLocation, useSearchParams } from "@solidjs/router";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface AuthenticatedMenuProps {
  onClose: () => void;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, _setGraph] = useGraph();
  const _navigate = useNavigate();
  const { showLoadingToast } = useToast();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAdminSubDomain = () => getMemberVertex(graph).P.subDomain === "admin";

  const getMenuItems = () => {
    const commonItems = [
      // { href: API.urls.admin.contact, icon: "ph:question", label: "Help" },
    ] as { href: string; icon: string; label: string; target?: string }[];

    if (!(isAdminSubDomain() || isAdminRole(graph))) {
      commonItems.push({
        href: API.urls.admin.support,
        icon: "ph:question",
        label: "Support",
        target: "_blank",
      });
    } else if (isAdminSubDomain()) {
      commonItems.push({
        href: `${window.location.origin.replace(`${getMemberVertex(graph).P.subDomain}.`, "")}/support/contact`,
        icon: "ph:question",
        label: "Support",
        target: "_blank",
      });
    }

    // Add "Import Local Pages" and "Export Pages and Components" menu items if user is admin and query param "admin" is present
    const adminMenuItems = [] as {
      href: string;
      icon: string;
      label: string;
      target?: string;
    }[];
    if (isAdminRole(graph) && searchParams.admin) {
      adminMenuItems.push({
        href: "/api/schema/import",
        icon: "ph:upload",
        label: "Import Local Pages",
        target: "_blank",
      });
      adminMenuItems.push({
        href: "/api/schema/export",
        icon: "ph:download",
        label: "Export Pages and Components",
        target: "_blank",
      });
    }

    return isAdminSubDomain()
      ? [
          {
            href: API.urls.system.projects,
            icon: "ph:umbrella",
            label: "Projects",
          },
          {
            href: API.urls.system.globalSettings,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: API.urls.system.userSettings,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...adminMenuItems,
          ...commonItems,
        ]
      : [
          {
            href: API.urls.admin.globalSettings,
            icon: "ph:gear",
            label: "Global Settings",
          },
          {
            href: API.urls.admin.userSettings,
            icon: "ph:user-gear",
            label: "User Settings",
          },
          ...adminMenuItems,
          ...commonItems,
        ];
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  padding: 10px;
}\`;`}
    >
      <For each={getMenuItems()}>
        {(item) => {
          const isActive =
            location.pathname ===
            new URL(item.href, window.location.origin).pathname;
          return (
            <As
              as="li"
              css={`return \`._id {
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
}\`;`}
            >
              <As
                as="a"
                css={[
                  `return \`._id {
  display: flex;
  align-items: center;
  color: \${args.theme.var.color.text};
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  &:hover {
    background-color: \${args.theme.var.color.primary_light_150};
    color: \${args.theme.var.color.primary_light_150_text};
  }
}\`;`,
                  isActive
                    ? `return \`._id { 
                        background-color: \${args.theme.var.color.primary_light_150}; 
                        color: \${args.theme.var.color.primary_light_150_text};
                        font-weight: bold; 
                      }\`;`
                    : `return \`._id { 
                        background-color: transparent; 
                        font-weight: normal; 
                      }\`;`,
                ]}
                href={item.href}
                onclick={props.onClose}
                target={item.target}
              >
                <As
                  as={Icon}
                  css={`return \`._id {
  margin-right: 10px;
  color: \${args.theme.var.color.primary};
}\`;`}
                  icon={item.icon}
                  width="20"
                />
                {item.label}
              </As>
            </As>
          );
        }}
      </For>
      <As
        as="hr"
        css={`return \`._id {
  margin-top: 8px;
  margin-bottom: 8px;
  color: \${args.theme.var.color.background_light_100};
}\`;`}
      />
      <li>
        <As
          as="a"
          css={`return \`._id {
  display: flex;
  align-items: center;
  width: 100%;
  color: \${args.theme.var.color.error};
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: \${args.theme.var.color.error_light_150};
    color: \${args.theme.var.color.error_light_150_text};
  }
}\`;`}
          href={API.urls.user.logout}
        >
          <As
            as={Icon}
            css={`return \`._id {
  margin-right: 10px;
}\`;`}
            icon="ph:sign-out"
            width="20"
          />
          Sign Out
        </As>
      </li>
    </As>
  );
}
