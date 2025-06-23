import { SettingsLayout } from "~/components/styled/SettingsLayout";
import { AccountDeletionForm } from "~/pages/user/account_delete/AccountDeletionForm";
import { PasswordChangeForm } from "~/pages/user/password_change/PasswordChangeForm";
import { ProfileSettings } from "~/pages/user/profile/ProfileSettings";

export default function SystemUserSettings() {
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
    {
      component: AccountDeletionForm,
      icon: "ph:trash",
      id: "delete-account",
      label: "Delete Account",
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
