import type { RowSelectionOptions } from "@tanstack/solid-table";

import { createAsync, useNavigate } from "@solidjs/router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  Match,
  on,
  Show,
  Switch,
} from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { CommonTable } from "~/components/styled/table/Table";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { generateFormMetaAttributes } from "~/features/page_designer/functions/form/generateFormMetaAttributes";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { createInputFilteredFormMetaData } from "~/lib/meta/functions/createInputFilteredFormMetaData";

import {
  DataGridProvider,
  type DataGridState,
  type DataGridStore,
  getInitialGridState,
} from "./context/DataGridContext";
import { getTableData as defaultGetTableData } from "./functions/getTableData";
import { useDeleteRowConfirm } from "./functions/useDeleteRowConfirm";
import { GridHeader } from "./header/GridHeader";
import { CreateGridHeaders } from "./schema/CreateGridHeaders";

import { PermissionLevel } from "~/features/page_attr_render/PermissionLevel";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getConfiguredPermissions } from "~/features/page_attr_render/getConfiguredPermissions";
import { hasPermissions } from "~/features/page_attr_render/hasPermissions";

interface DataGridProps {
  CustomAddNewButton?: (props: {
    disabled: boolean;
    onClick: () => void;
  }) => JSX.Element;
  editSchema?: IFormMetaData;
  enableMultiRowSelection?: RowSelectionOptions<Vertex>["enableMultiRowSelection"];
  enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
  formSchema?: IFormMetaData;
  getTableData?: typeof defaultGetTableData;
  hideDeleteAction?: boolean;
  hideEditAction?: boolean;
  hideEditJsonAction?: boolean;
  initialSelectedRowIds?: string[];
  initializeGridStoreParent?: (formStore: DataGridStore) => void;
  isShowPagination?: boolean;
  tableId: string;
}

// Define types for metadata results
type SuccessResult = {
  success: true;
  error?: undefined;
  form?: IFormMetaData;
  formSchema?: IFormMetaData;
  formFiltered?: IFormMetaData;
  data?: ServerResult;
  isDynamicForm?: boolean;
  isNoPermissionCheck?: boolean;
};

type ErrorResult = {
  error: string;
  success?: undefined;
};

type MetaDataResult = SuccessResult | ErrorResult;

// Define types for the Grid Data
type GridData = {
  metaResult?: SuccessResult;
  metaData?: IFormMetaData | null;
  isNoPermissionCheck?: boolean | null;
  tableData?: ServerResult;
  error?: string;
  isLoading?: boolean;
  isLoadMore?: boolean;
};

export function DataGrid(props: Readonly<DataGridProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();

  const [formMetaData, setFormMetaData] = createSignal<IFormMetaData | null>(
    null,
  );

  const gridStore = createStore<DataGridState>({
    ...getInitialGridState(graph),
    editSchema: props.editSchema,
    fetchTableData: async (skip, limit, isLoadMore) => {
      setGridState("isLoading", true);
      const tableResult = await fetchTableData(
        formMetaData(),
        skip,
        limit,
        isLoadMore,
      );
      if ("error" in tableResult) {
        return {
          error: tableResult.error,
        } as GridData;
      }
      if (isValidResponse(tableResult)) {
        processTableData(tableResult);
      }
      setGridState("isLoading", false);
      return tableResult;
    },
    get tableId() {
      return props.tableId;
    },
  });
  props.initializeGridStoreParent?.(gridStore);
  const [gridState, setGridState] = gridStore;

  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(
      getGlobalStore(graph).P.userRoles,
      gridState.metaVertex,
      graph,
    ),
  );

  const permissionChecks = {
    hasFullPermission: createMemo(
      () =>
        formMetaData() &&
        hasPermissions(allConfiguredPermission(), PermissionLevel.FULL),
    ),
    hasEditPermission: createMemo(
      () =>
        formMetaData() &&
        hasPermissions(allConfiguredPermission(), PermissionLevel.EDIT),
    ),
    hasCreatePermission: createMemo(
      () =>
        formMetaData() &&
        hasPermissions(allConfiguredPermission(), PermissionLevel.CREATE),
    ),
    hasViewPermission: createMemo(
      () =>
        formMetaData() &&
        hasPermissions(allConfiguredPermission(), PermissionLevel.VIEW),
    ),
  };

  setGridState({
    allConfiguredPermission,
    formMetaData,
    ...permissionChecks,
  });

  createEffect(
    on(
      [() => gridState.cardSize, () => gridState.layout],
      () => {
        saveUserSetting(
          {
            cardSize: gridState.cardSize,
            layout: gridState.layout,
          },
          graph,
          setGraph,
        );
      },
      { defer: true },
    ),
  );

  const loadMetaData = async (): Promise<MetaDataResult> => {
    if (props.formSchema) {
      return {
        success: true,
        formSchema: props.formSchema,
        isNoPermissionCheck: true,
      };
    }

    const form = FormMetaData[props.tableId] || FormMetaData.Page;
    if (!form) {
      return { error: `Page metadata for ${props.tableId} not found` };
    }

    const isDynamicForm =
      props.tableId !== "Page" && form === FormMetaData.Page;
    if (isDynamicForm) {
      if (!form.attributes) {
        return { error: `No attributes defined for form ${props.tableId}` };
      }

      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
      const data = await fetchDataFromDB({
        expression: `g:'Page[${props.tableId}]'`,
        [getGlobalStore(graph).P.url]: true,
        incoming,
        outgoing,
      });

      if (!isValidResponse(data) || data.result.length === 0) {
        return { error: `No ${props.tableId} configured` };
      }

      // Return the data without setting state
      return {
        success: true,
        data,
        isDynamicForm: true,
        form,
        isNoPermissionCheck: false,
      };
    }

    // For non-dynamic forms, just use createInputFilteredFormMetaData
    return {
      success: true,
      form,
      formFiltered: createInputFilteredFormMetaData(
        FormMetaData[props.tableId],
      ),
      isNoPermissionCheck: true,
    };
  };

  function getMetaVertex(result: unknown) {
    if (Array.isArray(result) && result.length > 0) {
      return graph.vertexes[result[0].id];
    }
    if (isObject(result)) {
      return graph.vertexes[(result as { id: string }).id];
    }
    return undefined;
  }

  const handleSearch = (value: string) => {
    setGridState("search", value);
    const isSearching = !!value && value.length > 0;
    setGridState("isSearching", isSearching);

    const filtered = isSearching
      ? gridState.tableStore.data.filter((item: Vertex) =>
          Object.values(item.P).some((prop: unknown) =>
            prop?.toString().toLowerCase().includes(value.toLowerCase()),
          ),
        )
      : gridState.tableStore.data;

    setGridState("filteredData", filtered);
  };

  async function fetchTableData(
    formMeta: IFormMetaData | null,
    skip?: number,
    limit?: number,
    loadMore?: boolean,
  ): Promise<ServerResult | { error: string; isLoadMore?: boolean }> {
    // Don't set state here, just return the loadMore flag with the result

    // Make sure we have the form metadata before fetching
    // Allow proceeding even without metadata if we're handling an error
    if (!(formMeta || loadMore)) {
      return { error: "Page metadata not loaded. Please try again." };
    }

    try {
      const data = await (props.getTableData || defaultGetTableData)(
        graph,
        formMeta!,
        props.tableId,
        skip,
        limit,
      );

      if (isValidResponse(data)) {
        // Return data with the loadMore flag if needed
        if (loadMore) {
          // We can't just spread ServerResult because it might have properties that clash with isLoadMore
          // Need to create a new object type that includes isLoadMore
          return {
            ...data,
            isLoadMore: true,
          };
        }
        return data;
      }
      return { error: getErrorMessage(data), isLoadMore: loadMore };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoadMore: loadMore,
      };
    }
  }

  // Common function to process metadata
  const processMetadata = (
    metaResult: SuccessResult,
  ): {
    formMeta: IFormMetaData | null;
    metaVertex?: Vertex;
    isNoPermissionCheck?: boolean;
  } => {
    let formMeta: IFormMetaData | null = null;
    let metaVertex: Vertex | undefined;
    let isNoPermissionCheck: boolean | undefined;

    if (metaResult.formSchema) {
      formMeta = metaResult.formSchema;
    } else if (metaResult.formFiltered) {
      formMeta = metaResult.formFiltered;
    } else if (metaResult.data) {
      // Process graph data
      setGraphData(graph, setGraph, metaResult.data.graph!);
      metaVertex = getMetaVertex(metaResult.data.result);

      if (metaVertex) {
        try {
          // Generate form meta attributes
          const updatedForm = generateFormMetaAttributes(
            graph,
            setGraph,
            metaVertex,
          );
          if (updatedForm) {
            formMeta = updatedForm;
          } else if (metaResult.form) {
            // Fall back to filtered form if generation fails
            formMeta = createInputFilteredFormMetaData(metaResult.form);
          }
        } catch (error) {
          console.error("Error generating form meta attributes:", error);
          // Fall back to filtered form on error
          if (metaResult.form) {
            formMeta = createInputFilteredFormMetaData(metaResult.form);
          }
        }
      } else if (metaResult.form) {
        // No metaVertex, use filtered form
        formMeta = createInputFilteredFormMetaData(metaResult.form);
      }
    } else if (metaResult.form) {
      formMeta = createInputFilteredFormMetaData(metaResult.form);
    }

    // Set permission check flag
    if (metaResult.isNoPermissionCheck !== undefined) {
      isNoPermissionCheck = metaResult.isNoPermissionCheck;
    }

    return { formMeta, metaVertex, isNoPermissionCheck };
  };

  // Common function to process table data
  const processTableData = (tableData: ServerResult, isLoadMore = false) => {
    const vertexCount = tableData.result.length;
    setGridState("isShowLoadMore", vertexCount >= 10);
    setGraphData(graph, setGraph, tableData.graph!);
    const nodes: Vertex[] =
      isLoadMore && gridState.tableStore.data
        ? [...gridState.tableStore.data, ...tableData.result]
        : tableData.result;

    const tableColumns = CreateGridHeaders(
      gridState,
      formMetaData()!,
      graph,
      setGraph,
      (id) => setGridState("deleteRowId", id),
      navigate,
      props.tableId,
      props.hideDeleteAction,
      props.hideEditJsonAction,
      props.hideEditAction,
    );

    const mappedData = nodes.map((node: Vertex) => graph.vertexes[node.id]);

    setGridState("tableStore", {
      data: mappedData,
      tableColumns,
    });
    setGridState("search", "");
    // Track data from the graph store
    setGridState("filteredData", [...mappedData]);

    // Handle initial row selection
    if (
      !isLoadMore &&
      props.initialSelectedRowIds &&
      props.initialSelectedRowIds.length > 0
    ) {
      const selectedRows = mappedData.filter((row) =>
        props.initialSelectedRowIds!.includes(row.id),
      );
      if (selectedRows.length > 0) {
        setGridState("selectedRows", selectedRows);
      }
    }

    // Reset the loading more flag after processing
    setGridState("isLoadingMore", false);
  };

  // Combined data resource for both metadata and table data
  const dataResource = createAsync(
    async () => {
      if (!props.tableId) {
        return { error: "No tableId provided" } as GridData;
      }

      // First load metadata
      const metaResult = await loadMetaData();
      if ("error" in metaResult) {
        return { error: metaResult.error } as GridData;
      }

      const { formMeta, isNoPermissionCheck } = processMetadata(metaResult);

      // Then load table data
      const tableResult = await fetchTableData(
        formMeta,
        undefined,
        undefined,
        false,
      );
      if ("error" in tableResult) {
        return {
          metaResult: props.formSchema ? null : metaResult,
          metaData: props.formSchema ? null : formMeta,
          isNoPermissionCheck,
          error: tableResult.error,
        } as GridData;
      }

      // Return both results
      return {
        metaResult: props.formSchema ? null : metaResult,
        metaData: props.formSchema ? null : formMeta,
        isNoPermissionCheck,
        tableData: tableResult,
      } as GridData;
    },
    { deferStream: true },
  );

  // Process data both on the client-side as well (for hydration)
  const processResult = () => {
    const result = dataResource();
    if (!result) {
      return;
    }

    try {
      // Handle errors
      if (result.error) {
        setGridState("error", result.error || "");
      } else {
        setGridState("error", "");
      }

      if (props.formSchema) {
        setFormMetaData(props.formSchema);
      }
      // Process metadata again for client-side hydration
      if (result.metaResult?.data) {
        setGraphData(graph, setGraph, result.metaResult.data.graph!);
        const metaVertex = getMetaVertex(result.metaResult.data.result);
        if (metaVertex) {
          setGridState("metaVertex", metaVertex);
        }
      }
      if (result.metaData) {
        setFormMetaData(result.metaData);
      }
      if (result.isNoPermissionCheck !== undefined) {
        setGridState("isNoPermissionCheck", result.isNoPermissionCheck!);
      }

      // Process table data if available
      if (result.tableData && isValidResponse(result.tableData)) {
        try {
          // Check if isLoadMore exists in tableData
          const isLoadMoreValue =
            "isLoadMore" in result.tableData &&
            result.tableData.isLoadMore === true;
          processTableData(result.tableData, isLoadMoreValue);
        } catch (error) {
          console.error("Error processing table data:", error);
          setGridState(
            "error",
            error instanceof Error
              ? error.message
              : "An error occurred processing table data",
          );
        }
      }
    } catch (e) {
      console.error("Error processing data resource:", e);
    }
  };

  // Handle loading more data separately - this function will be called from the UI
  const loadMoreData = async (skip?: number, limit?: number) => {
    try {
      // Get current form metadata value
      const currentFormMeta = formMetaData();
      // Set the loading more flag
      setGridState("isLoading", true);
      setGridState("isLoadingMore", true);

      // Fetch the data with loadMore=true
      const data = await fetchTableData(currentFormMeta, skip, limit, true);

      // Process the results directly if there's an error
      if ("error" in data) {
        setGridState("error", data.error || "");
        setGridState("isLoadingMore", false);
        setGridState("isLoading", false);
        return;
      }

      // Process successful data
      if (isValidResponse(data)) {
        processTableData(data, true);
      }
    } catch (error) {
      console.error("Error loading more data:", error);
      setGridState(
        "error",
        error instanceof Error
          ? error.message
          : "An error occurred loading more data",
      );
      setGridState("isLoadingMore", false);
    }
  };

  const onDelete = useDeleteRowConfirm(gridState, setGridState);

  const ContentSSR = () => {
    processResult();
    return (
      <DataGridProvider value={gridStore}>
        <Switch>
          <Match when={dataResource()?.error}>
            <div>Error: {dataResource()?.error}</div>
          </Match>
          <Match when={formMetaData()}>
            <GridHeader
              CustomAddNewButton={props.CustomAddNewButton}
              formMetaData={formMetaData()!}
              onSearch={handleSearch}
            />
            <Show when={gridState.isLoading}>
              <LoaderNew loaderHeight="55vh" />
            </Show>
            {/* IF we not reload table Inline schmea renderer form gives error, because its not properly reloaded */}
            <Show when={!(gridState.isLoading || gridState.isLoadingMore)}>
              <CommonTable
                allConfiguredPermission={allConfiguredPermission()}
                cardSize={gridState.cardSize}
                data={gridState.filteredData}
                defaultRowsPerPage={10}
                enableMultiRowSelection={props.enableMultiRowSelection}
                enableRowSelection={props.enableRowSelection}
                headers={gridState.tableStore.tableColumns}
                isSearching={gridState.isSearching}
                isShowLoadMore={gridState.isShowLoadMore}
                isShowPagination={props.isShowPagination}
                layout={gridState.layout}
                onLoadMore={(skip, limit) => {
                  void loadMoreData(skip, limit);
                }}
                rowsPerPageOptions={[5, 10, 15]}
                selectedRows={gridState.selectedRows}
                setSelectedRows={(rows: Vertex[]) =>
                  setGridState("selectedRows", rows)
                }
                totalItems={gridState.filteredData.length}
              />
            </Show>
            <Show when={gridState.deleteRowId}>
              <DialogWithButtons
                message="Are you sure you want to delete this item?"
                onCancel={() => setGridState("deleteRowId", null)}
                onConfirm={onDelete}
                open={
                  (() => gridState.deleteRowId) as unknown as Accessor<boolean>
                }
                setOpen={() => setGridState("deleteRowId", null)}
                title="Delete Item"
              />
            </Show>
          </Match>
        </Switch>
      </DataGridProvider>
    );
  };

  return (
    <Show when={dataResource()} keyed>
      <ContentSSR />
    </Show>
  );
}
