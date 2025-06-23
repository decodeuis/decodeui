import { FileUploader } from "~/components/styled/FileUploader";
import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { uploadFile } from "~/lib/api/uploadFile";
import { evalExpression } from "~/lib/expression_eval";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { parentDirectory } from "~/lib/meta/file/File";
import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { useFileManagerStore } from "../FileManagerContext";
import { getFolderFormSchema } from "./folderFormSchema";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface UploadResponse {
  result: Array<{
    [key: string]: unknown;
    id: string;
  }>;
}

export function AddNewFileButton() {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore] = useFileManagerStore();
  const { showErrorToast, showLoadingToast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) {
      throw new Error("No file provided");
    }
    try {
      const data = await uploadFile(file, API.file.uploadFileUrl);
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const saveFileRelationship = async (data: UploadResponse) => {
    const currentItem = fileManagerStore.selectedItem;
    if (!currentItem) {
      return;
    }
    const folder: Vertex =
      currentItem.L[0] === "Folder"
        ? currentItem
        : evalExpression("->ParentFolder", {
            graph,
            setGraph,
            vertexes: [currentItem],
          })[0];
    const newFormTxnId = generateNewTxnId(graph, setGraph);

    const parentFolderMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: parentDirectory,
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      data.result[0] as unknown as Vertex,
      graph,
      setGraph,
      parentFolderMetaVertex,
      folder.id,
    );

    const commitData = commitTxn(newFormTxnId, graph);

    if (!commitData) {
      showErrorToast("Failed to commit transaction");
      return false;
    }

    try {
      const isSuccess = await submitDataCall(
        { ...commitData },
        graph,
        setGraph,
        newFormTxnId,
      );
      if (isSuccess) {
        fileManagerStore.gridStore?.[0].fetchTableData();
      }
      return isSuccess;
    } catch (error) {
      console.error("Error submitting data:", error);
      showErrorToast("Failed to process uploaded file");
      return false;
    }
  };

  const handleFileSelect = async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }

    try {
      await showLoadingToast({
        loadMessage: "Uploading file...",
        promise: (async () => {
          const data = await handleFileUpload(file);
          if (data?.graph) {
            setGraphData(graph, setGraph, data.graph);
          }
          if (data?.result) {
            await saveFileRelationship(data);
          }
          return data;
        })(),
        successMessage: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error in file upload process:", error);
      showErrorToast("Failed to upload file");
    }
  };

  return (
    <As
      as="div"
      css={[
        `return \`._id {
  display: flex;
  gap: 4px;
}\`;`,
      ]}
    >
      <FileUploader handleFileSelect={handleFileSelect} label="Upload File" />
      <SchemaRenderer form={getFolderFormSchema(() => {})} />
    </As>
  );
}
