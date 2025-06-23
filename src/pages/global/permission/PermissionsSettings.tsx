import FileManager from "~/features/file_manager/FileManager";

export function PermissionsSettings() {
  return (
    <FileManager
      parentVertexLabel="Perm"
      rootKeys={{ $or: [{ key: "Root" }] }}
      toParentEdgeType="ParentPerm"
    />
  );
}
