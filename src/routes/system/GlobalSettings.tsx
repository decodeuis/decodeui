import { clientOnly } from "@solidjs/start";

const SystemGlobalSettingsRoute = clientOnly(
  () => import("~/pages/global/SystemGlobalSettings"),
);

export default SystemGlobalSettingsRoute;
