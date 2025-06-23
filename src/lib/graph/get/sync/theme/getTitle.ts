import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";
import { APP_NAME, APP_VERSION } from "~/pages/settings/constants";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getTitle(title: string, graph?: GraphInterface) {
  const appName = () =>
    graph ? getGlobalSettingVertex(graph)?.P.appName || APP_NAME : APP_NAME;

  return `${title.trim()} | ${appName()} v${APP_VERSION}`;
}
