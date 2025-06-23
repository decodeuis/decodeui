import type { Vertex } from "~/lib/graph/type/vertex";

export function DebugPermissionInfo(
  props: Readonly<{
    allConfiguredPermission: Vertex[];
    authError: string;
    hasFullPermission: boolean;
    hasEditPermission: boolean;
    hasCreatePermission: boolean;
    hasViewPermission: boolean;
    isNoPermissionCheck: boolean;
    metaVertexId?: string;
    mounted: boolean;
    userRoles: string[];
  }>,
) {
  return (
    <div>
      <p>User Roles: {JSON.stringify(props.userRoles)}</p>
      <p>
        allConfiguredPermission: {JSON.stringify(props.allConfiguredPermission)}
      </p>
      <p>hasCreatePermission: {props.hasCreatePermission.toString()}</p>
      <p>hasEditPermission: {props.hasEditPermission.toString()}</p>
      <p>hasViewPermission: {props.hasViewPermission.toString()}</p>
      <p>hasFullPermission: {props.hasFullPermission.toString()}</p>
      <p>mounted: {props.mounted.toString()}</p>
      <p>authError: {props.authError}</p>
      <p>metaVertex: {props.metaVertexId}</p>
      <p>isNoPermissionCheck: {props.isNoPermissionCheck?.toString()}</p>
    </div>
  );
}
