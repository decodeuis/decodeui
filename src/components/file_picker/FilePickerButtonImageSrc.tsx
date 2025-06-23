import { createMemo, createSignal } from "solid-js";

import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";

import {
  type FormStoreObject,
  useFormContext,
} from "~/components/form/context/FormContext";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { evalExpression } from "~/lib/expression_eval";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";

import { FilePickerModal } from "./FilePickerModal";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface FilePickerButtonProps {
  handleChange: (value: string) => void;
  meta: Vertex;
  value: string;
}

export function FilePickerButton(props: Readonly<FilePickerButtonProps>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let fileManagerStore: FileManagerObject;
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const { showErrorToast } = useToast();

  const selectedFileVertex = createMemo((): Vertex[] => {
    if (!props.meta) {
      return [];
    }
    return (
      evalExpression("->$0Src", { graph, setGraph, vertexes: [props.meta] }) ||
      []
    );
  });

  const onFileSelected = () => {
    const selectedFile = fileManagerStore.gridStore?.[0].selectedRows[0];
    if (!selectedFile) {
      showErrorToast("Please select a file");
      return;
    }
    const txnId = formVertex()?.P.txnId;
    if (!txnId) {
      showErrorToast("unable to select file");
      return;
    }

    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        key: "src",
      },
    } as Vertex;

    setSelectionValue(
      txnId,
      props.meta,
      graph,
      setGraph,
      selectedFileMetaVertex,
      selectedFile.id,
    );

    if (!(props.value ?? "").includes("$1")) {
      const newValue = `$1${props.value ?? ""}`;
      props.handleChange(newValue);
    }

    setOpenDialog(false);
  };

  const setFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    fileManagerStore = fileManagerStore_;
  };

  return (
    <>
      <IconButton
        css={[
          selectedFileVertex()?.length > 0
            ? `return \`._id {color: \${args.theme.var.color.success};}\`;`
            : `return \`._id {color: \${args.theme.var.color.text};}\`;`,
          `return \`._id {
            background-color: transparent;
            border: none;
          }\`;`,
        ]}
        icon={"ph:image-square"}
        onClick={() => setOpenDialog(true)}
        size={16}
      />
      <FilePickerModal
        onFileSelected={onFileSelected}
        open={openDialog}
        selectedFileVertex={selectedFileVertex()}
        setFileManagerStore={setFileManagerStore}
        setOpen={setOpenDialog}
      />
    </>
  );
}
