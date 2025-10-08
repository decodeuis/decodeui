import { useNavigate } from "@solidjs/router";
import { type JSX, Show, createSignal } from "solid-js";
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
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/type/vertex";

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
  const [showNewModal, setShowNewModal] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let formStoreId: string | undefined;
  
  const handleClose = (action?: string) => {
    // Find the form store vertex and revert its transaction
    if (formStoreId && graph.vertexes[formStoreId]) {
      const formStore = graph.vertexes[formStoreId] as Vertex<FormStoreObject>;
      if (formStore?.P?.txnId) {
        revertTransaction(formStore.P.txnId, graph, setGraph);
      }
    }
    setShowNewModal(false);
    if (action === "Submit") {
      gridState.fetchTableData();
    }
  };
  
  const onAddNew = () => {
    // Check if form is inline editable
    if (props.formMetaData?.isInlineEditable) {
      setShowNewModal(true);
    } else {
      navigate(`/admin/${gridState.tableId}/new`);
    }
  };

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
      
      {/* Modal for inline editable forms */}
      <Show when={showNewModal() && props.formMetaData?.isInlineEditable}>
        <CustomModal
          open={() => showNewModal()}
          setOpen={(open) => {
            if (!open) handleClose();
            else setShowNewModal(true);
          }}
          title={`Add New ${gridState.tableId}`}
          containerCss={`return \`._id {
            width: 80%; 
            max-width: 1200px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }\`;`}
          dialogCss={`return \`._id {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }\`;`}
          bodyCss={`return \`._id {
            overflow-y: auto;
            flex: 1;
            min-height: 0;
          }\`;`}
        >
          <PageViewWrapper
            dataId="new"
            pageVertexName={gridState.tableId!}
            initializeFormStoreParent={(id) => { formStoreId = id; }}
            closePopUp={handleClose}
          />
        </CustomModal>
      </Show>
    </As>
  );
}
