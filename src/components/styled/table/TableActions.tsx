import { type Accessor, For, Show } from "solid-js";

import { IconButton } from "../IconButton";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

export function TableActions(
  props: Readonly<{
    currentPage: Accessor<number>;
    data: Vertex[];
    displayedRows: Accessor<Vertex[]>;
    handleFirstPage: () => void;
    handleLastPage: () => void;
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    handleRowsPerPageChange: (e: Event) => void;
    rowsPerPage: Accessor<number>;
    rowsPerPageOptions?: number[];
    totalPages: Accessor<number>;
  }>,
) {
  // Creates pagination button style based on disabled state
  const getPaginationButtonStyle = (isDisabled: boolean) => {
    return [
      `return \`._id {
        justify-content: center;
        padding: 0.375rem;
        border-radius: 4px;
        transition: all 0.2s ease;
      }\`;`,
      isDisabled
        ? `return \`._id {
            background-color: \${args.theme.var.color.background_light_300};
            border: 1px solid \${args.theme.var.color.border};
            color: \${args.theme.var.color.text_light_600};
            &:hover {
              background-color: \${args.theme.var.color.background_light_300};
            }
          }\`;`
        : `return \`._id {
            background-color: \${args.theme.var.color.background_light_100};
            border: 1px solid \${args.theme.var.color.primary_light_800};
            color: \${args.theme.var.color.primary};
            &:hover {
              background-color: \${args.theme.var.color.primary_light_900};
              border-color: \${args.theme.var.color.primary};
            }
          }\`;`,
    ];
  };

  // Create start navigation disabled state
  const isStartDisabled = () => props.currentPage() === 0;

  // Create end navigation disabled state
  const isEndDisabled = () => props.currentPage() === props.totalPages() - 1;

  return (
    <Show when={props.displayedRows().length > 0}>
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background-color: \${args.theme.var.color.background_light_300};
          color: \${args.theme.var.color.background_light_300_text};
          border-radius: 0 0 10px 10px;
          box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
        }\`;`}
      >
        {/* Rows per page selector */}
        <As
          as="div"
          css={`return \`._id {
            display: flex;
            align-items: center;
          }\`;`}
        >
          <As
            as="label"
            html-for="rowsPerPage"
            css={`return \`._id {
              font-size: 0.875rem;
              color: \${args.theme.var.color.text};
              margin-right: 0.5rem;
            }\`;`}
          >
            Rows per page:
          </As>
          <As
            as="select"
            css={`return \`._id {
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              border: 1px solid \${args.theme.var.color.primary_light_800};
              background-color: \${args.theme.var.color.background_light_100};
              color: \${args.theme.var.color.background_light_100_text};
              font-size: 0.875rem;
              cursor: pointer;
              outline: none;
              &:focus {
                border-color: \${args.theme.var.color.primary};
                box-shadow: 0 0 0 2px \${args.theme.var.color.primary_light_800};
              }
            }\`;`}
            id="rowsPerPage"
            onChange={props.handleRowsPerPageChange}
            value={props.rowsPerPage()}
          >
            <For each={props.rowsPerPageOptions || [10, 20, 50, 100]}>
              {(option) => (
                <As
                  as="option"
                  css={`return \`._id {
                    color: \${args.theme.var.color.text};
                    background-color: \${args.theme.var.color.background_light_100};
                    color: \${args.theme.var.color.background_light_100_text};
                  }\`;`}
                  value={option}
                >
                  {option}
                </As>
              )}
            </For>
          </As>
        </As>

        {/* Page information */}
        <As
          as="div"
          css={`return \`._id {
            font-size: 0.875rem;
            color: \${args.theme.var.color.text};
            font-weight: 500;
          }\`;`}
        >
          <span>{`${props.currentPage() * props.rowsPerPage() + 1}-${Math.min(
            (props.currentPage() + 1) * props.rowsPerPage(),
            props.data.length,
          )} of ${props.data.length}`}</span>
        </As>

        {/* Pagination buttons */}
        <As
          as="div"
          css={`return \`._id {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }\`;`}
        >
          <IconButton
            css={getPaginationButtonStyle(isStartDisabled())}
            disabled={isStartDisabled()}
            icon="icon-park-outline:go-start"
            onClick={props.handleFirstPage}
            size={18}
            title="First page"
          />
          <IconButton
            css={getPaginationButtonStyle(isStartDisabled())}
            disabled={isStartDisabled()}
            icon="icon-park-outline:left"
            onClick={props.handlePreviousPage}
            size={18}
            title="Previous page"
          />
          <IconButton
            css={getPaginationButtonStyle(isEndDisabled())}
            disabled={isEndDisabled()}
            icon="icon-park-outline:right"
            onClick={props.handleNextPage}
            size={18}
            title="Next page"
          />
          <IconButton
            css={getPaginationButtonStyle(isEndDisabled())}
            disabled={isEndDisabled()}
            icon="icon-park-outline:go-end"
            onClick={props.handleLastPage}
            size={18}
            title="Last page"
          />
        </As>
      </As>
    </Show>
  );
}
