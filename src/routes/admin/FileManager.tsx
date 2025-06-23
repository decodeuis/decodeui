import FileManager from "~/features/file_manager/FileManager";

export default function FileManagerPage() {
  return (
    <FileManager parentVertexLabel="Folder" toParentEdgeType="ParentFolder" />
  );
}
