import { API } from "../api/endpoints";

export type HomeUrlContext = "admin" | "default" | "system";

export function getHomeUrl(context: HomeUrlContext = "default"): string {
  switch (context) {
    case "admin":
      return API.urls.admin.root;
    case "system":
      return API.urls.system.root;
    default:
      return "/";
  }
}
