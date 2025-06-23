import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { PasswordChangeForm } from "~/pages/user/password_change/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/profile/ProfileSettings";

export default function AdminUserSettings() {
  const menuItems = [
    {
      component: ProfileSettings,
      icon: "ph:user",
      id: "profile",
      label: "Profile",
    },
    {
      component: PasswordChangeForm,
      icon: "ph:key",
      id: "password",
      label: "Change Password",
    },
  ];

  return (
    <SettingsLayout
      description="Manage your account settings and preferences."
      menuItems={menuItems}
      title="Account Settings"
    />
  );
}
