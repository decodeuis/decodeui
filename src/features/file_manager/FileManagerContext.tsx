import type { RowSelectionOptions } from "@tanstack/solid-table";

import { useParams } from "@solidjs/router";
import { batch, createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

import type { MongoFilter } from "~/cypher/queries/evaluate/mongoToCypher";
import type { DataGridStore } from "~/features/grid/context/DataGridContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFilesData } from "./sidebar/getFilesData";
import { getParentData } from "./sidebar/getParentData";
import { getRootData } from "./sidebar/getRootData";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";

const getInitialFileManagerStore = () => {
  return {
    editSchema: null as IFormMetaData | null,
    enableRowSelection:
      undefined as RowSelectionOptions<Vertex>["enableRowSelection"],
    expandedKeys: [] as string[],
    gridStore: null as DataGridStore | null,
    initialSelectedFileId: null as string | null,
    parentVertexLabel: "Folder",
    root: null as null | Vertex[],
    rootKeys: { key: "Root" } as MongoFilter,
    selectedItem: null as null | Vertex,
    toParentEdgeType: "ParentFolder",
    treeItemHoverId: null as null | string,
    useLocalData: true,
    useSidebarData: true,
  };
};

export type FileManagerObject = ReturnType<typeof getInitialFileManagerStore>;
export type FileManagerStore = ReturnType<
  typeof createStore<FileManagerObject>
>;
export const FileManagerStoreContext = createContext<FileManagerStore>();

// fetch current children and children of children
export async function fetchChildrenDataBatch(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  expandedKeys: string[],
) {
  if (expandedKeys.length === 0) {
    return;
  }
  const data = await getFilesData(
    graph,
    setGraph,
    toParentEdgeType,
    expandedKeys,
  );
  if (
    "result" in data &&
    Array.isArray(data.result) &&
    data.result.length > 0
  ) {
    await getFilesData(
      graph,
      setGraph,
      toParentEdgeType,
      data.result.map((v) => v.id),
    );
  }
}

export function FileManagerStoreProvider(
  props: Readonly<{
    children: JSX.Element;
    editSchema?: IFormMetaData;
    enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
    fileId?: string;
    onFileSelected?: (file: Vertex) => void;
    parentVertexLabel: string;
    rootKeys?: MongoFilter;
    setFileManagerStore?: (fileManagerStore: FileManagerObject) => void;
    toParentEdgeType: string;
  }>,
) {
  const fileManagerStore = createStore({
    ...getInitialFileManagerStore(),
    get editSchema() {
      return props.editSchema || null;
    },
    get enableRowSelection() {
      return props.enableRowSelection;
    },
    initialSelectedFileId: props.fileId || null,
    get parentVertexLabel() {
      return props.parentVertexLabel;
    },
    rootKeys: props.rootKeys || { key: "Root" },
    get toParentEdgeType() {
      return props.toParentEdgeType;
    },
  });
  props.setFileManagerStore?.(fileManagerStore[0]);
  const [graph, setGraph] = useGraph();
  const params = useParams();

  onMount(async () => {
    const { expandedKeys, root, selectedItem } = await fetchRootData(
      graph,
      setGraph,
      props.toParentEdgeType,
      props.parentVertexLabel,
      fileManagerStore[0].rootKeys,
      params.folderId,
      props.fileId,
    );

    await fetchChildrenDataBatch(
      graph,
      setGraph,
      fileManagerStore[0].toParentEdgeType,
      expandedKeys,
    );

    batch(() => {
      fileManagerStore[1]("useLocalData", true);
      if (root) {
        fileManagerStore[1]("root", root);
      }
      fileManagerStore[1]("expandedKeys", expandedKeys);
      if (selectedItem) {
        fileManagerStore[1]("selectedItem", selectedItem);
      }
    });
    fileManagerStore[1]("useLocalData", false);
  });

  return (
    <FileManagerStoreContext.Provider value={fileManagerStore}>
      {props.children}
    </FileManagerStoreContext.Provider>
  );
}

export function useFileManagerStore() {
  return useContext(FileManagerStoreContext)!;
}

async function fetchRootData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  toParentEdgeType: string,
  parentVertexLabel: string,
  rootKeys: MongoFilter,
  folderId?: string,
  fileId?: string,
) {
  let expandedKeys: string[] = [];
  let selectedItem: null | Vertex = null;
  let root: null | Vertex[] = null;

  if (folderId || fileId) {
    const rootData = await getParentData(
      graph,
      setGraph,
      toParentEdgeType,
      folderId,
      fileId,
    );
    if ("result" in rootData && rootData.result.length > 0) {
      const resultData = rootData.result as Vertex[];
      expandedKeys = resultData.map((v) => v.id);

      if (folderId) {
        // when folderId is provided, we want to select the same folder
        selectedItem = { ...graph.vertexes[folderId] };
      } else {
        selectedItem = { ...resultData[0] };
      }
    }
  }
  const rootData = await getRootData(
    graph,
    setGraph,
    parentVertexLabel,
    rootKeys,
  );
  if ("result" in rootData && rootData.result.length > 0) {
    root = rootData.result;
    expandedKeys = [...expandedKeys, ...root!.map((v) => v.id)];
    if (!selectedItem) {
      selectedItem = { ...root![0] } as Vertex;
    }
  }

  return { expandedKeys, root, selectedItem };
}
