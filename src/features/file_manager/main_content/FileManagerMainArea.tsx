import { createEffect, createMemo, createSignal, For } from "solid-js";

import { DataGrid } from "~/features/grid/DataGrid";
import { evalExpression } from "~/lib/expression_eval";
import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { useFileManagerStore } from "../FileManagerContext";
import { getFilesData } from "../sidebar/getFilesData";
import { AddNewFileButton } from "./AddNewFileButton";
import { getEditFileOrFolderSchema } from "./fileFormEditSchema";
import { getComponentFormSchema } from "./getComponentFormSchema";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FileManagerMainArea(props: Readonly<{ item: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const [_children, setChildren] = createSignal<Vertex[]>([]);

  const fetchChildren = async (item: Vertex) => {
    const data = await getFilesData(
      graph,
      setGraph,
      fileManagerStore.toParentEdgeType,
      item.id,
    );
    if (!data.error && data.result) {
      setChildren(data.result);
    }
    return data;
  };

  const breadcrumb = createMemo(() => {
    const breadcrumbItems: Vertex[] = [];
    let currentItem: null | Vertex = props.item;

    while (currentItem) {
      breadcrumbItems.unshift(currentItem);
      const parentVertex: Vertex[] =
        evalExpression(`->${fileManagerStore.toParentEdgeType}`, {
          graph,
          setGraph,
          vertexes: [currentItem],
        }) || [];
      currentItem = parentVertex[0];
    }

    return breadcrumbItems;
  });

  createEffect(() => {
    fetchChildren(props.item);
  });

  return (
    <div>
      <As
        as="div"
        css={[
          `return \`._id {
  display: flex;
  gap: 2px;
  padding: 2px;
}\`;`,
        ]}
      >
        <For each={breadcrumb()}>
          {(item, index) => (
            <As
              as="button"
              css={[
                `return \`._id {
  color: \${args.theme.var.color.primary};
  background-color: transparent;
  border: none;
  ${index() === 0 ? "font-weight:600" : ""} cursor:pointer}\`;`,
              ]}
              onClick={() => setFileManagerStore("selectedItem", item)}
              type="button"
            >
              {item.P.key}
              {index() < breadcrumb().length - 1 && " / "}
            </As>
          )}
        </For>
      </As>
      <div>
        <DataGrid
          CustomAddNewButton={
            fileManagerStore.parentVertexLabel === "Comp" ||
            fileManagerStore.parentVertexLabel === "Perm"
              ? () => (
                  <SchemaRenderer
                    form={getComponentFormSchema(
                      () => {},
                      () => {},
                      fileManagerStore.parentVertexLabel as "Comp" | "Perm",
                    )}
                  />
                )
              : AddNewFileButton
          }
          editSchema={
            fileManagerStore.editSchema ??
            (fileManagerStore.parentVertexLabel === "Comp" ||
            fileManagerStore.parentVertexLabel === "Perm"
              ? getComponentFormSchema(
                  () => {},
                  () => {},
                  fileManagerStore.parentVertexLabel as "Comp" | "Perm",
                )
              : getEditFileOrFolderSchema(() => {}))
          }
          enableRowSelection={fileManagerStore.enableRowSelection}
          getTableData={() => fetchChildren(props.item)}
          initialSelectedRowIds={
            fileManagerStore.initialSelectedFileId
              ? [fileManagerStore.initialSelectedFileId]
              : undefined
          }
          initializeGridStoreParent={(gridStore_) => {
            setFileManagerStore({
              get gridStore() {
                return gridStore_;
              },
            });
          }}
          isShowPagination={true}
          tableId={
            fileManagerStore.parentVertexLabel === "Folder"
              ? "File"
              : fileManagerStore.parentVertexLabel
          }
        />
      </div>
    </div>
  );
}
