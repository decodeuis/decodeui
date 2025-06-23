import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { EmailSettings } from "~/pages/global/email/EmailSettings";

export default function SystemGlobalSettings() {
  const menuItems = [
    {
      component: EmailSettings,
      icon: "ph:envelope",
      id: "email",
      label: "Email Settings",
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
