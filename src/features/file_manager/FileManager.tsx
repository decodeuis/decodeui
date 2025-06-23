import type { RowSelectionOptions } from "@tanstack/solid-table";

import type { MongoFilter } from "~/cypher/queries/evaluate/mongoToCypher";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import {
  type FileManagerObject,
  FileManagerStoreProvider,
} from "./FileManagerContext";
import { FileManagerMainContent } from "./main_content/FileManagerMainContent";
import { Sidebar } from "./sidebar/FileManagerSideBar";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

export default function FileManager(
  props: Readonly<{
    editSchema?: IFormMetaData;
    enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
    fileId?: string;
    parentVertexLabel: string;
    rootKeys?: MongoFilter;
    setFileManagerStore?: (fileManagerStore: FileManagerObject) => void;
    toParentEdgeType: string;
  }>,
) {
  return (
    <FileManagerStoreProvider
      editSchema={props.editSchema}
      enableRowSelection={props.enableRowSelection}
      fileId={props.fileId}
      parentVertexLabel={props.parentVertexLabel}
      rootKeys={props.rootKeys}
      setFileManagerStore={props.setFileManagerStore}
      toParentEdgeType={props.toParentEdgeType}
    >
      <As
        as="div"
        css={[
          `return \`._id {
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(2, 20% calc(80% - 4px));
}\`;`,
        ]}
      >
        <Sidebar />
        <FileManagerMainContent />
      </As>
    </FileManagerStoreProvider>
  );
}

// Plan:
// Preview file
// Copy file
// Copy folder

// Move File/Folder:
// On File Drag Over not possible.
// On File Drop, just change the parent.
// Root is not possible to move.

// Delete File/Folder:
// In the delete dialog, show where the file is used. (IMP)
// Dont allow to delete non empty folders.
// Implement proper validations and authorization checks to ensure that user can only delete their own files and folders.

// Implement validation that only authorized users can view or download the file.

// Provide UI to replace the file.

// Make file upload component validate according to properties (file type, size, restrictions).

// Provide clear instructions and feedback during file upload process, such as progress indicators and error messages.

// Implement a search functionality to quickly find files or folders by name.

// Implement a file preview feature to allow users to view the contents of a file before downloading it.

// Implement a file sharing feature to allow users to share files with others.
