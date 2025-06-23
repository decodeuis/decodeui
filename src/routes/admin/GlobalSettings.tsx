import { clientOnly } from "@solidjs/start";

const GlobalSettingsRoute = clientOnly(
  () => import("~/pages/global/AdminGlobalSettings"),
);

export default GlobalSettingsRoute;
