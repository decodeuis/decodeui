import type { Vertex } from "~/lib/graph/type/vertex";
import { PermissionLevel } from "~/features/page_attr_render/PermissionLevel";

export function hasPermissions(
  configuredPermissions: Vertex[],
  permission: PermissionLevel,
) {
  for (const r of configuredPermissions) {
    // Check if the configured permission matches or is higher level than requested
    if (r.P.access === permission) {
      return true;
    }
    // Higher level permissions implicitly grant lower level permissions
    if (
      permission === PermissionLevel.VIEW &&
      [
        PermissionLevel.EDIT,
        PermissionLevel.FULL,
        PermissionLevel.CREATE,
      ].includes(r.P.access)
    ) {
      return true;
    }
    if (
      permission === PermissionLevel.CREATE &&
      [PermissionLevel.EDIT, PermissionLevel.FULL].includes(r.P.access)
    ) {
      return true;
    }
    if (
      permission === PermissionLevel.EDIT &&
      PermissionLevel.FULL === r.P.access
    ) {
      return true;
    }
  }
  return;
}
/*
export function inheritPermissions(
  permissionsArray: [] | PageRenderStore[],
  permissionKey: keyof typeof InitialPermissions
): boolean | undefined {
  for (let i = permissionsArray.length - 1; i >= 0; i--) {
    const permissionValue = permissionsArray[i][0][permissionKey];
    if (permissionValue !== undefined) {
      return permissionValue;
    }
  }
  return undefined;
}*/
