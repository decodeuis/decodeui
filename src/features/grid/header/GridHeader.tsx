import { useNavigate } from "@solidjs/router";
import { type JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";
import { SearchBar } from "~/components/styled/SearchBar";
import {
  headerIconButtonCss,
  PROPERTIES,
  STYLES,
} from "~/pages/settings/constants";

import { IconButton } from "~/components/styled/IconButton";
import { useDataGridContext } from "../context/DataGridContext";
import { AddNewButton } from "./AddNewButton";
import { As } from "~/components/As";

interface GridHeaderProps {
  CustomAddNewButton?: (props: {
    disabled: boolean;
    onClick: () => void;
  }) => JSX.Element;
  formMetaData?: IFormMetaData | null;
  onSearch: (value: string) => void;
}

export function GridHeader(props: Readonly<GridHeaderProps>) {
  const [gridState, setGridState] = useDataGridContext();
  const navigate = useNavigate();
  const onAddNew = () => navigate(`/admin/${gridState.tableId}/new`);

  const isTableLayout = () => gridState.layout === "table";

  const handleRefresh = async () => {
    await gridState.fetchTableData();
  };

  return (
    <As
      as="div"
      css={[
        `return \`._id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
}\`;`,
      ]}
    >
      <Dynamic
        component={props.CustomAddNewButton || AddNewButton}
        disabled={
          gridState.isNoPermissionCheck
            ? false
            : !!props.formMetaData && !gridState.hasCreatePermission()
        }
        onClick={onAddNew}
      />
      <As
        as="div"
        css={[
          `return \`._id {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}\`;`,
        ]}
      >
        <SearchBar
          handleChange={props.onSearch}
          placeholder="Search Data..."
          value={gridState.search}
        />
        <IconButton
          css={[headerIconButtonCss]}
          disabled={gridState.isLoading}
          icon={gridState.isLoading ? "ph:spinner-gap" : "ph:arrows-clockwise"}
          iconCss={
            gridState.isLoading
              ? `return \`._id {transition: transform 1s infinite linear;}\`;`
              : ""
          }
          onClick={handleRefresh}
          title="Refresh Data"
        />
        <IconButton
          css={[headerIconButtonCss]}
          disabled={gridState.isLoading}
          icon={isTableLayout() ? "ph:identification-card" : "ph:table"}
          onClick={() =>
            setGridState("layout", isTableLayout() ? "card" : "table")
          }
          title={`Switch to ${isTableLayout() ? "Card" : "Table"} Layout`}
        />
        <Show when={!isTableLayout()}>
          <TooltipWrapper
            arrowCss={STYLES.tooltip.arrowCss}
            content="Column Size"
          >
            <As
              as="input"
              css={[PROPERTIES.Css.TextFieldCss]}
              max="10"
              min="1"
              onInput={(e) =>
                setGridState("cardSize", Number(e.currentTarget.value))
              }
              type="number"
              value={gridState.cardSize}
            />
          </TooltipWrapper>
        </Show>
      </As>
    </As>
  );
}
