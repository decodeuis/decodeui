import type { Accessor } from "solid-js";

import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import FileManager from "~/features/file_manager/FileManager";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

export function FilePickerModal(props: {
  onFileSelected: (selectedFile: Vertex) => void;
  open: Accessor<boolean>;
  selectedFileVertex: Vertex[];
  setFileManagerStore: (fileManagerStore: FileManagerObject) => void;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CustomModal
      containerCss={`return \`._id {z-index: 2000;}\`;`}
      dialogCss={`return \`._id {width: 90vw; border-radius: 10px; padding: 0; height: 90vh; display: flex; flex-direction: column;}\`;`}
      footer={() => (
        <DialogFooter
          buttonText="Select"
          css={[
            SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
            `return \`._id {
              margin-left: auto;
              margin-right: 8px;
            }\`;`,
          ]}
          containerCss={`return \`._id {margin-top: auto;}\`;`}
          onClick={() => {
            return props.onFileSelected(props.selectedFileVertex[0]);
          }}
          type="button"
        />
      )}
      isCloseOnOutsideClick={false}
      open={props.open}
      setOpen={props.setOpen}
      title="File Manager"
    >
      <As as="div">
        <FileManager
          enableRowSelection={(vertex) =>
            (vertex as unknown as Vertex).L[0] === "File"
          }
          fileId={props.selectedFileVertex[0]?.id}
          parentVertexLabel="Folder"
          setFileManagerStore={props.setFileManagerStore}
          toParentEdgeType="ParentFolder"
        />
      </As>
    </CustomModal>
  );
}
