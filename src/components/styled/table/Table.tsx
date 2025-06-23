import type { ColumnDef, RowSelectionOptions } from "@tanstack/solid-table";

import {
  createMemo,
  createSignal,
  For,
  type JSX,
  Match,
  Show,
  Switch,
} from "solid-js";

import {
  CardDetailRow,
  CardDetailsContainer,
} from "~/components/styled/card/CardDetails";
import { CardHeader } from "~/components/styled/card/CardHeader";
import { CardOptionsContainer } from "~/components/styled/card/CardOptions";
import {
  CardContainer,
  CardHeaderContainer,
} from "~/components/styled/card/SimpleCard";
import {
  Table,
  TableBodyCell,
  TableHeadCell,
} from "~/components/styled/SimpleTable";

import { CardGrid } from "../CardGrid";
import { TableActions } from "./TableActions";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

type TableProps = {
  allConfiguredPermission: Vertex[];
  cardSize: number;
  data: Vertex[];
  defaultRowsPerPage?: number;
  enableMultiRowSelection?: RowSelectionOptions<Vertex>["enableMultiRowSelection"];
  enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
  headers: ColumnDef<any>[];
  isSearching: boolean;
  isShowLoadMore?: boolean;
  isShowPagination?: boolean;
  layout: "card" | "table";
  onLoadMore: (skip: number, limit: number) => void;
  rowsPerPageOptions?: number[];
  selectedRows: Vertex[];
  setSelectedRows: (rows: Vertex[]) => void;
  totalItems: number;
};

const getValue = (header: any, row: Vertex) => {
  // path expression:
  return header.accessorKey.split(".").reduce((acc, key) => acc[key], row);
};

export function CommonTable(props: Readonly<TableProps>) {
  const [currentPage, setCurrentPage] = createSignal(0);
  const [rowsPerPage, setRowsPerPage] = createSignal(
    props.defaultRowsPerPage ?? 10,
  );

  const totalPages = () => Math.ceil(props.totalItems / rowsPerPage());
  const displayedRows = () => {
    const startIndex = currentPage() * rowsPerPage();
    const endIndex = startIndex + rowsPerPage();
    return props.data.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages() - 1)));
  };

  const handleRowsPerPageChange = (e: Event) => {
    const newRowsPerPage = Number((e.target as HTMLSelectElement).value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const handleRowSelect = (row: Vertex) => {
    const selected = props.selectedRows;
    const isSelected = selected.some((r) => r.id === row.id);

    if (isSelected) {
      props.setSelectedRows(
        props.enableMultiRowSelection
          ? selected.filter((r) => r.id !== row.id)
          : [],
      );
    } else {
      props.setSelectedRows(
        props.enableMultiRowSelection ? [...selected, row] : [row],
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      props.setSelectedRows(displayedRows());
    } else {
      props.setSelectedRows([]);
    }
  };

  const allSelected = createMemo(() =>
    displayedRows().every((row) =>
      props.selectedRows.some((r) => r.id === row.id),
    ),
  );
  const someSelected = createMemo(
    () =>
      !allSelected() &&
      displayedRows().some((row) =>
        props.selectedRows.some((r) => r.id === row.id),
      ),
  );

  const FallBack = () => (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  grid-column: span ${props.headers.length} / span ${props.headers.length};
  justify-content: center;
  padding: 1rem;
}\`;`}
    >
      No records to display
    </As>
  );

  const hideHeaders = () =>
    props.headers.filter(
      (header) =>
        !(
          ["Actions", "key"].includes(header.header) ||
          ["Actions", "key"].includes(header.key)
        ),
    );

  const isMultiRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableMultiRowSelection === "function"
      ? props.enableMultiRowSelection(row)
      : props.enableMultiRowSelection;
  };

  const isRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableRowSelection === "function"
      ? props.enableRowSelection(row)
      : props.enableRowSelection;
  };

  return (
    <As
      as="div"
      css={`return \`._id {
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0,0,0,0.15);
  padding: 4px 10px;
  width: 100%;
}\`;`}
    >
      <Switch>
        <Match when={props.layout === "table"}>
          <Table
            headers={
              props.headers.length +
              (props.enableMultiRowSelection || props.enableRowSelection
                ? 1
                : 0)
            }
          >
            <TableHead
              allSelected={allSelected()}
              enableMultiRowSelection={props.enableMultiRowSelection}
              enableRowSelection={props.enableRowSelection}
              headers={props.headers}
              onSelectAll={handleSelectAll}
              someSelected={someSelected()}
            />
            <TableBody
              enableMultiRowSelection={props.enableMultiRowSelection}
              enableRowSelection={props.enableRowSelection}
              fallback={<FallBack />}
              headers={props.headers}
              onRowSelect={handleRowSelect}
              rows={displayedRows()}
              selectedRows={props.selectedRows}
            />
          </Table>
        </Match>
        <Match when={props.layout === "card"}>
          <CardGrid cardSize={props.cardSize}>
            <For each={displayedRows()} fallback={<FallBack />}>
              {(row) => (
                <CardContainer>
                  <CardHeaderContainer>
                    <CardHeader>
                      <Content
                        header={
                          props.headers.find((header) => header.key === "key")!
                        }
                        row={row}
                      />
                    </CardHeader>
                    <Show
                      when={
                        isMultiRowSelectionEnabled(row) ||
                        isRowSelectionEnabled(row)
                      }
                    >
                      <input
                        checked={props.selectedRows.some(
                          (r) => r.id === row.id,
                        )}
                        onChange={() => handleRowSelect(row)}
                        type="checkbox"
                      />
                    </Show>
                    <Show
                      when={props.headers.find(
                        (header) => header.header === "Actions",
                      )}
                    >
                      {(header) => (
                        <CardOptionsContainer>
                          <Content header={header()} row={row} />
                        </CardOptionsContainer>
                      )}
                    </Show>
                  </CardHeaderContainer>
                  <CardDetailsContainer>
                    <For each={hideHeaders()}>
                      {(header) => (
                        <CardDetailRow label={header.header}>
                          <Content header={header} row={row} />
                        </CardDetailRow>
                      )}
                    </For>
                  </CardDetailsContainer>
                </CardContainer>
              )}
            </For>
          </CardGrid>
        </Match>
      </Switch>

      <Show when={props.isShowPagination}>
        <TableActions
          currentPage={currentPage}
          data={props.data}
          displayedRows={displayedRows}
          handleFirstPage={() => handlePageChange(0)}
          handleLastPage={() => handlePageChange(totalPages() - 1)}
          handleNextPage={() => handlePageChange(currentPage() + 1)}
          handlePreviousPage={() => handlePageChange(currentPage() - 1)}
          handleRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={props.rowsPerPageOptions}
          totalPages={totalPages}
        />
      </Show>
      <Show
        when={
          (currentPage() === totalPages() - 1 ||
            (currentPage() === 0 && props.data.length < props.totalItems)) &&
          props.isShowLoadMore &&
          !props.isSearching
        }
      >
        <LoadMoreButton
          onClick={() => props.onLoadMore(props.data.length, rowsPerPage())}
        />
      </Show>
    </As>
  );
}

function TableHead(
  props: Readonly<{
    allSelected: boolean;
    enableMultiRowSelection?: RowSelectionOptions<Vertex>["enableMultiRowSelection"];
    enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
    headers: ColumnDef<any>[];
    onSelectAll: (checked: boolean) => void;
    someSelected: boolean;
  }>,
) {
  return (
    <>
      <Show when={props.enableMultiRowSelection || props.enableRowSelection}>
        <TableHeadCell>
          <Show when={props.enableMultiRowSelection}>
            <input
              checked={props.allSelected}
              indeterminate={props.someSelected && !props.allSelected}
              onChange={(e) =>
                props.onSelectAll((e.target as HTMLInputElement).checked)
              }
              type="checkbox"
            />
          </Show>
        </TableHeadCell>
      </Show>
      <For each={props.headers}>
        {(header) => <TableHeadCell>{header.header}</TableHeadCell>}
      </For>
    </>
  );
}

const Content = (props: { header: ColumnDef<any>; row: Vertex }) =>
  // on card layout,sometimes header.cell is undefined
  props.header?.cell?.({
    getValue: () => getValue(props.header, props.row),
    row: { original: props.row },
  }) ?? null;

function LoadMoreButton(props: Readonly<{ onClick: () => void }>) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  justify-content: end;
  padding: 5px 10px;
}\`;`}
    >
      <As
        as="button"
        css={`return \`._id {
  background-color: \${args.theme.var.color.primary};
  border-right: 5px solid;
  cursor: pointer;
  padding: 10px;
  color: \${args.theme.var.color.primary_text};
}\`;`}
        onClick={props.onClick}
      >
        Load More
      </As>
    </As>
  );
}

function TableBody(
  props: Readonly<{
    enableMultiRowSelection?: RowSelectionOptions<Vertex>["enableMultiRowSelection"];
    enableRowSelection?: RowSelectionOptions<Vertex>["enableRowSelection"];
    fallback: JSX.Element;
    headers: ColumnDef<any>[];
    onRowSelect: (row: Vertex) => void;
    rows: Vertex[];
    selectedRows: Vertex[];
  }>,
) {
  const isMultiRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableMultiRowSelection === "function"
      ? props.enableMultiRowSelection(row)
      : props.enableMultiRowSelection;
  };

  const isRowSelectionEnabled = (row: Vertex) => {
    return typeof props.enableRowSelection === "function"
      ? props.enableRowSelection(row)
      : props.enableRowSelection;
  };
  return (
    <For each={props.rows} fallback={props.fallback}>
      {(row, index) => (
        <>
          <Show
            when={props.enableMultiRowSelection || props.enableRowSelection}
          >
            <TableBodyCell
              css={
                props.selectedRows.includes(row)
                  ? `return \`._id {background-color: \${args.theme.var.color.primary_light_600}; color: \${args.theme.var.color.primary_light_600_text};}\`;`
                  : ""
              }
              index={index()}
            >
              <Show
                when={
                  isMultiRowSelectionEnabled(row) || isRowSelectionEnabled(row)
                }
              >
                <input
                  checked={props.selectedRows.includes(row)}
                  onChange={() => props.onRowSelect(row)}
                  type="checkbox"
                />
              </Show>
            </TableBodyCell>
          </Show>
          <For each={props.headers}>
            {(header: any) => (
              <TableBodyCell
                css={
                  props.selectedRows.includes(row)
                    ? `return \`._id {background-color: \${args.theme.var.color.primary_light_600}; color: \${args.theme.var.color.primary_light_600_text};}\`;`
                    : ""
                }
                index={index()}
              >
                <Content header={header} row={row} />
              </TableBodyCell>
            )}
          </For>
        </>
      )}
    </For>
  );
}
