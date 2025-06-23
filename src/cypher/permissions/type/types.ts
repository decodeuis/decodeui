export const SYSTEM_ROLES = {
  ADMIN: "Admin",
  GUEST: "Guest",
  SYSTEM_ADMIN: "SystemAdmin",
  USER: "User",
} as const;

export const PERMISSIONS = {
  CREATE_USER: "create:user",
  DELETE_FILES: "delete:files",
  DELETE_USER: "delete:user",
  EDIT_USER: "edit:user",
  MANAGE_ROLES: "manage:roles",
  MANAGE_SYSTEM: "manage:system",
  UPLOAD_FILES: "upload:files",
  VIEW_FILES: "view:files",
  VIEW_USER: "view:user",
} as const;
