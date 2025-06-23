import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { ActivityLog } from "~/pages/global/activity/ActivityLog";
import { EmailAudit } from "~/pages/global/email/EmailAudit";
import { EmailSettings } from "~/pages/global/email/EmailSettings";
import { GeneralSettings } from "~/pages/global/general/GeneralSettings";
import { PermissionsSettings } from "~/pages/global/permission/PermissionsSettings";
import { RoleSettings } from "~/pages/global/role/RoleSettings";
import { SupportTickets } from "~/pages/global/support/SupportTickets";
import { ThemeSettings } from "~/pages/global/theme/ThemeSettings";
import { UserManagement } from "~/pages/global/user/UserManagement";

export default function AdminGlobalSettings() {
  const menuItems = [
    {
      component: GeneralSettings,
      group: "Basic Settings",
      icon: "ph:gear",
      id: "general",
      label: "General",
    },
    // {
    //   component: CompanySettings,
    //   group: "Basic Settings",
    //   icon: "ph:buildings",
    //   id: "company",
    //   label: "Company Details",
    // },
    {
      component: EmailSettings,
      group: "Communication",
      icon: "ph:envelope",
      id: "email",
      label: "Email Settings",
    },
    {
      component: ThemeSettings,
      group: "Appearance",
      icon: "ph:paint-brush",
      id: "theme",
      label: "Theme Settings",
    },
    {
      component: PermissionsSettings,
      group: "Access Control",
      icon: "ph:lock",
      id: "permissions",
      label: "Permissions",
    },
    {
      component: RoleSettings,
      group: "Access Control",
      icon: "ph:users-three",
      id: "roles",
      label: "Roles",
    },
    {
      component: UserManagement,
      group: "Access Control",
      icon: "ph:user-gear",
      id: "users",
      label: "Users",
    },
    {
      component: EmailAudit,
      group: "Monitoring",
      icon: "ph:envelope-simple-open",
      id: "email-audit",
      label: "Email Audit",
    },
    {
      component: ActivityLog,
      group: "Monitoring",
      icon: "ph:activity",
      id: "activity-log",
      label: "Activity Log",
    },
    {
      component: SupportTickets,
      group: "Support",
      icon: "ph:ticket",
      id: "support-tickets",
      label: "Support Tickets",
    },
  ];

  return (
    <SettingsLayout
      description="Manage global application settings"
      menuItems={menuItems}
      title="Global Settings"
    />
  );
}
