import { clientOnly } from "@solidjs/start";

const SystemUserSettingsRoute = clientOnly(
  () => import("~/pages/user/SystemUserSettings"),
);

export default SystemUserSettingsRoute;
