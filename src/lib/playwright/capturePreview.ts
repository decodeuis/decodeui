import type { SetStoreFunction } from "solid-js/store";

import { domToPng } from "modern-screenshot";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { API } from "~/lib/api/endpoints";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { uploadFile } from "~/lib/api/uploadFile";
import { evalExpression } from "~/lib/expression_eval";
import { getToEdge } from "~/lib/graph/get/sync/edge/getToEdge";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

import { setGraphData } from "../graph/mutate/core/setGraphData";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export async function captureElementToPng(element: HTMLElement): Promise<File> {
  const dataUrl = await domToPng(element);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], "preview.png", { type: "image/png" });
}

export async function captureFullElementToPng(
  element: HTMLElement,
): Promise<File> {
  // Store original styles
  const originalOverflow = element.style.overflow;
  const originalOverflowX = element.style.overflowX;
  const originalOverflowY = element.style.overflowY;

  try {
    // Hide scrollbars
    element.style.overflow = "hidden";
    element.style.overflowX = "hidden";
    element.style.overflowY = "hidden";

    // Capture with options to include full content
    const dataUrl = await domToPng(element, {
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        overflow: "hidden",
      },
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], "preview.png", { type: "image/png" });
  } finally {
    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.overflowX = originalOverflowX;
    element.style.overflowY = originalOverflowY;
  }
}

export function downloadFile(file: File | Blob, fileName?: string): void {
  if (!file) {
    throw new Error("File or Blob is required");
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || (file instanceof File ? file.name : "download");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (window) {
  window.domToPng = domToPng;
  window.downloadFile = downloadFile;
  window.captureElementToPng = captureElementToPng;
  window.captureFullElementToPng = captureFullElementToPng;
  // captureFullElementToPng(document.querySelector('.layout')).then(downloadFile)
}

export async function capturePreview(
  formStoreVertex: () => Vertex<FormStoreObject>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  showErrorToast: (message: string) => void,
) {
  // Store the current selectedId
  const currentSelectedId = formStoreVertex().P.selectedId;

  try {
    // Temporarily remove the selectedId
    if (currentSelectedId !== undefined) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex().id,
        graph,
        setGraph,
        {
          selectedId: -1,
        },
      );
    }

    // Wait a small moment for the UI to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the iframe for this form
    const iframe = document.querySelector(
      `iframe[name="${formStoreVertex().id}"]`,
    ) as HTMLIFrameElement;

    if (!iframe) {
      throw new Error("Iframe not found");
    }

    // Capture screenshot
    const file = await captureElementToPng(iframe.contentDocument!.body);

    const imgSaveTxnId = generateNewTxnId(graph, setGraph);
    const existingPreview =
      evalExpression("->$0Preview", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formStoreVertex().P.formDataId!]!],
      }) || [];

    let previewData;
    if (existingPreview.length > 0) {
      // Update existing preview
      const preview = existingPreview[existingPreview.length - 1];
      previewData = await uploadFile(
        file,
        `${API.file.replaceFileUrl}?fileId=${preview.id}`,
        "PUT",
      );
      if (previewData?.graph) {
        setGraphData(graph, setGraph, previewData.graph);
      }
    } else {
      // Create new preview
      previewData = await uploadFile(file, API.file.uploadFileUrl);
      if (previewData?.graph) {
        setGraphData(graph, setGraph, previewData.graph);
      }

      if (previewData?.result) {
        const previewVertexId =
          previewData.result[previewData.result.length - 1].id;
        const previewEdge = newEdge(
          generateNewVertexId(graph, setGraph),
          getToEdge(
            { P: { key: "Preview" } } as unknown as Vertex,
            graph.vertexes[formStoreVertex().P.formDataId!],
          ),
          {},
          formStoreVertex().P.formDataId,
          previewVertexId,
        );

        const addNewEdgeResult = addNewEdge(
          imgSaveTxnId,
          previewEdge,
          graph,
          setGraph,
        );

        if (addNewEdgeResult.error) {
          throw new Error(addNewEdgeResult.error as string);
        }

        const data = commitTxn(imgSaveTxnId, graph);
        if (data) {
          submitDataCall(data, graph, setGraph, imgSaveTxnId);
        }
      }
    }

    if (!previewData?.result) {
      throw new Error("Failed to capture preview");
    }

    return true;
  } catch (error) {
    console.error("Failed to capture preview:", error);
    showErrorToast(
      error instanceof Error ? error.message : "Failed to capture preview",
    );
    return false;
  } finally {
    // Restore the selectedId
    if (currentSelectedId !== undefined) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex().id,
        graph,
        setGraph,
        {
          selectedId: currentSelectedId,
        },
      );
    }
  }
}
