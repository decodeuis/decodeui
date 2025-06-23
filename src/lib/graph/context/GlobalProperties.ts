import type { Id } from "~/lib/graph/type/id";

export interface GlobalProperties {
  activeClickOutside: string[];
  initialDataFetchError: string;
  isDevelopment: boolean;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  newVertexId_: number;
  txnId_: number;
  url: string;
  userRoles: Id[];
  userSettingId: Id;
  tooltipRegistry?: { [key: string]: string[] }; // which tooltips belong to which group
  activeTooltips?: { [key: string]: boolean };
  subdomain?: string; // Current subdomain
  domain?: string; // Current domain
  // isAuthenticated: false,
  // theme: "light" as "light" | "dark",
  // notifications: [] as Array<{ id: number; message: string; type: "info" | "warning" | "error" }>,
  // language: "en" as string,
}
