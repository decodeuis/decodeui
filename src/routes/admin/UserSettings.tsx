import { clientOnly } from "@solidjs/start";

const AdminUserSettingsRoute = clientOnly(
  () => import("~/pages/user/AdminUserSettings"),
);

export default AdminUserSettingsRoute;
