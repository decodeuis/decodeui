import FileManager from "~/features/file_manager/FileManager";

// https://www.npmjs.com/package/@flmngr/flmngr-react
export default function FileManagerPage() {
  return (
    <FileManager parentVertexLabel="Folder" toParentEdgeType="ParentFolder" />
  );
}
