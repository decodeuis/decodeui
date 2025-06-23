import { createSelector, createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { insertNewRow } from "~/components/fields/table_field/functions/insertNewRow";
import { ZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useToast } from "~/components/styled/modal/Toast";
import { QuickEditModal } from "~/features/grid/cell/QuickEditModal";
import { CommonAddComponent } from "~/features/page_designer/settings/variants/header/CommonAddComponent";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { useFileManagerStore } from "../FileManagerContext";
import { getDownloadLink, openInNewTab } from "./getDownloadLink";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FileManagerConfigIcons(
  props: Readonly<{ getChildrenItems?: () => void; metaVertex: Vertex }>,
) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, _setFileManagerStore] = useFileManagerStore();
  const isSelectedItemId = createSelector(
    () => fileManagerStore.selectedItem?.id,
  );
  const isHoveredItemId = createSelector(
    () => fileManagerStore.treeItemHoverId,
  );
  const { showErrorToast, showSuccessToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);

  const [state, setState] = createStore({
    buttonRef: null as HTMLElement | null,
    dialogAction: (_name: string) => {},
    dialogLabel: "",
    dialogPlaceholder: "",
    dialogTitle: "",
    showDialog: false,
  });

  const handleCreateNewDirectory = async (key: string) => {
    try {
      const newFormTxnId = generateNewTxnId(graph, setGraph);
      const tableMetaVertex = {
        id: props.metaVertex.id,
        IN: {},
        L: [],
        OUT: {},
        P: {
          inward: true,
          label: "Folder",
          type: "ParentFolder",
        },
      } as Vertex;

      const _rowResult = insertNewRow(
        newFormTxnId,
        tableMetaVertex,
        props.metaVertex,
        false,
        graph,
        setGraph,
        { key },
      );
      const data = commitTxn(newFormTxnId, graph);

      if (!data) {
        showErrorToast("Failed to create directory");
        return;
      }

      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast("Directory created successfully");
      props.getChildrenItems?.();
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to create directory");
    }
  };

  const handleCreateNewFile = (_name: string) => {
    // TODO: on new File add display full modal to insert file metaData or upload a file component
  };

  const handleRenameItem = (_name: string) => {};

  const openDialog = (
    title: string,
    label: string,
    placeholder: string,
    action: (key: string) => void,
    ref: HTMLElement,
  ) => {
    setState({
      buttonRef: ref,
      dialogAction: action,
      dialogLabel: label,
      dialogPlaceholder: placeholder,
      dialogTitle: title,
      showDialog: true,
    });
  };

  return (
    <As
      as="div"
      css={[
        `return \`._id {
  display: flex;
  align-items: center;
}\`;`,
      ]}
    >
      <Show
        when={
          state.showDialog ||
          isSelectedItemId(props.metaVertex.id) ||
          isHoveredItemId(props.metaVertex.id)
        }
      >
        <Show when={props.metaVertex.L[0] === "File"}>
          <IconButton
            css={[
              ICON_BUTTON_STYLES.baseCss,
              ICON_BUTTON_STYLES.defaultCss,
              ICON_BUTTON_STYLES.spacingCss,
              `return \`._id {
                background-color: transparent;
                border: none;
              }\`;`,
            ]}
            icon="ic:round-download"
            iconCss={`return \`._id {transition: transform 0.2s}\`;`}
            onClick={() => openInNewTab(getDownloadLink(props.metaVertex))}
            size={18}
            title="Download"
          />
        </Show>
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
                background-color: transparent;
                border: none;
              }\`;`,
          ]}
          icon="ph:gear"
          iconCss={`return \`._id {transition: transform 0.2s}\`;`}
          onClick={() => setIsEditModalOpen(true)}
          size={18}
          title="Settings"
        />
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
              background-color: transparent;
              border: none;
            }\`;`,
          ]}
          icon="ph:folder-plus"
          iconCss={`return \`._id {transition: transform 0.2s}\`;`}
          onClick={(e) =>
            openDialog(
              "Add New Directory",
              "Enter Directory Name",
              "Enter directory key",
              handleCreateNewDirectory,
              e.currentTarget,
            )
          }
          size={18}
          title="Create New Directory"
        />
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            ICON_BUTTON_STYLES.spacingCss,
            `return \`._id {
              background-color: transparent;
              border: none;
            }\`;`,
          ]}
          icon="ph:file-plus"
          iconCss={`return \`._id {transition: transform 0.2s}\`;`}
          onClick={(e) =>
            openDialog(
              "Add New File",
              "Enter File Name",
              "Enter file key",
              handleCreateNewFile,
              e.currentTarget,
            )
          }
          size={18}
          title="Create New File"
        />
        <Show
          when={
            !fileManagerStore.root?.some(
              (root) => root.id === props.metaVertex.id,
            )
          }
        >
          <IconButton
            css={[
              ICON_BUTTON_STYLES.baseCss,
              ICON_BUTTON_STYLES.defaultCss,
              ICON_BUTTON_STYLES.spacingCss,
              `return \`._id {
                background-color: transparent;
                border: none;
              }\`;`,
            ]}
            icon="ph:textbox"
            iconCss={`return \`._id {transition: transform 0.2s}\`;`}
            onClick={(e) =>
              openDialog(
                `Rename ${props.metaVertex.L[0]}`,
                `Enter ${props.metaVertex.L[0]} Name`,
                "Enter new key",
                handleRenameItem,
                e.currentTarget,
              )
            }
            size={18}
            title="Rename"
          />
          <IconButton
            css={[
              ICON_BUTTON_STYLES.baseCss,
              ICON_BUTTON_STYLES.deleteCss,
              ICON_BUTTON_STYLES.spacingCss,
              `return \`._id {
                background-color: transparent;
                border: none;
              }\`;`,
            ]}
            icon="ph:trash"
            iconCss={`return \`._id {transition: transform 0.2s}\`;`}
            onClick={() => {}}
            size={18}
            title="Delete"
          />
        </Show>
      </Show>
      <Show when={state.showDialog}>
        <ZIndex>
          <DropdownMenu
            css={`return \`._id {
  border-radius: 5px;
  background-color: transparent;
  border: none;
}\`;`}
            onClickOutside={() => setState("showDialog", false)}
            parentRef={state.buttonRef!}
          >
            <CommonAddComponent
              addNewState={(key) => {
                state.dialogAction(key);
                setState("showDialog", false);
              }}
              label={state.dialogLabel}
              onClose={() => setState("showDialog", false)}
              placeholder={state.dialogPlaceholder}
              title={state.dialogTitle}
            />
          </DropdownMenu>
        </ZIndex>
      </Show>
      <Show when={isEditModalOpen()}>
        <QuickEditModal
          disabled={false}
          info={{ row: { original: props.metaVertex } }}
          onClose={() => setIsEditModalOpen(false)}
          tableId={props.metaVertex.L[0]}
        />
      </Show>
    </As>
  );
}
