import type { ColumnDef } from "@tanstack/solid-table";
import type { createStore } from "solid-js/store";

import { type Accessor, createContext, type JSX, useContext } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export type DataGridState = ReturnType<typeof getInitialGridState>;
export type DataGridStore = ReturnType<typeof createStore<DataGridState>>;

export function getInitialGridState(graph: GraphInterface) {
  return {
    allConfiguredPermission: (() => []) as Accessor<Vertex[]>,
    cardSize:
      graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P.cardSize || 3,
    deleteRowId: null as Id | null,
    editSchema: undefined as IFormMetaData | undefined,
    error: null as null | string,
    fetchTableData: (() => {}) as (
      skip?: number,
      limit?: number,
      isLoadMore?: boolean,
    ) => Promise<
      | ServerResult
      | {
          error: string;
        }
    >,
    filteredData: [] as Vertex[],
    formId: null as Id | null,
    formMetaData: (() => null) as Accessor<IFormMetaData | null>,
    hasFullPermission: (() => false) as Accessor<boolean | null | undefined>,
    hasEditPermission: (() => false) as Accessor<boolean | null | undefined>,
    hasCreatePermission: (() => false) as Accessor<boolean | null | undefined>,
    hasViewPermission: (() => false) as Accessor<boolean | null | undefined>,
    isLoading: false,
    isLoadingMore: false,
    isNoPermissionCheck: false,
    isSearching: false,
    isShowLoadMore: true,
    layout: (graph.vertexes[getGlobalStore(graph).P.userSettingId]?.P.layout ||
      "table") as "card" | "table",
    metaVertex: null as null | Vertex,
    search: "",
    selectedRows: [] as Vertex[],
    tableId: null as null | string,
    tableStore: {
      data: [] as any[],
      tableColumns: [] as ColumnDef<any>[],
    },
  };
}

export const DataGridStoreContext = createContext<DataGridStore>();

const DataGridContext = createContext<DataGridStore>();

export function DataGridProvider(
  props: Readonly<{ children: JSX.Element; value: DataGridStore }>,
) {
  return (
    <DataGridContext.Provider value={props.value}>
      {props.children}
    </DataGridContext.Provider>
  );
}

export function useDataGridContext() {
  return useContext(DataGridContext)!;
}
