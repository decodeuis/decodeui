import type { ColumnDef } from "@tanstack/solid-table";
import type { SetStoreFunction, Store } from "solid-js/store";

import { Match, Show, Switch } from "solid-js";

import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { getSelectNameValue } from "~/features/grid/functions/getSelectNameValue";
import { getTagValue } from "~/features/grid/functions/getTagValue";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { STYLES } from "~/pages/settings/constants";

import type { DataGridState } from "../context/DataGridContext";

import { IconButton } from "~/components/styled/IconButton";
import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";
import { selectedValue } from "~/lib/graph/get/sync/edge/selectedValue";
import { ModifyJsonButton } from "../cell/ModifyJsonButton";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

function ImageWrapper(props: { alt?: string; css?: string; src: string }) {
  return (
    <Show when={props.src}>
      <As
        as="img"
        alt={props.alt || "Preview"}
        css={props.css}
        src={props.src}
      />
    </Show>
  );
}

const getPreviewVertex = (
  attribute: FieldAttribute,
  data: Vertex,
  graph: Store<GraphInterface>,
) => {
  const vertexId = selectedValue(
    {
      P: attribute,
    } as unknown as Vertex,
    data,
    graph,
  )?.[0];
  return vertexId ? graph.vertexes[vertexId] : undefined;
};
const getPreviewURL = (
  attribute: FieldAttribute,
  data: Vertex,
  graph: Store<GraphInterface>,
) => {
  const vertex = getPreviewVertex(attribute, data, graph);
  if (vertex) {
    return getDownloadLink(vertex);
  }
  return "";
};

export function CreateGridHeaders(
  gridState: DataGridState,
  formNew: IFormMetaData,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  setDeleteRowId: (id: Id) => void,
  navigate: (path: string) => void,
  tableId: string,
  hideDeleteAction?: boolean,
  hideEditJsonAction?: boolean,
  hideEditAction?: boolean,
) {
  const tableColumns = [] as ColumnDef<Vertex>[];

  for (const attribute of formNew.attributes) {
    const column = { ...attribute } as unknown as ColumnDef<Vertex>;
    if (
      attribute.hideInGrid ||
      attribute.componentName === "Table" ||
      attribute.componentName === "DynamicTable"
    ) {
      continue;
    }
    // @ts-expect-error ignore
    column.accessorKey = `P.${attribute.key}`;
    column.id = attribute.key;
    column.cell =
      attribute.cell ||
      ((info) => {
        return (
          <Switch>
            <Match
              when={
                (PageDesignerLabels.includes(tableId) ||
                  tableId === "Component") &&
                attribute.key === "Preview"
              }
            >
              <TooltipWrapper
                arrowCss={STYLES.tooltip.arrowCss}
                content={
                  <As
                    as="div"
                    css={`return \`._id {
                    border: 2px solid \${args.theme.var.color.border};
                  }\`;`}
                  >
                    <As
                      as="div"
                      css={`return \`._id {
                      background: \${args.theme.var.color.background_light_50};
                      color: \${args.theme.var.color.background_light_50_text};
                      padding: 8px;
                    }\`;`}
                    >
                      <ImageWrapper
                        alt="Preview"
                        src={getPreviewURL(attribute, info.row.original, graph)}
                      />
                    </As>
                  </As>
                }
                triggerAs="span"
                triggerCss={`return \`._id {
                  display: flex;
                  align-items: center;
                }\`;`}
              >
                <As
                  as="span"
                  css={`return \`._id {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }\`;`}
                >
                  <ImageWrapper
                    alt="Preview"
                    css={`return \`._id {
                      border-radius: 4px;
                      height: 30px;
                      object-fit: cover;
                    }\`;`}
                    src={getPreviewURL(attribute, info.row.original, graph)}
                  />
                </As>
              </TooltipWrapper>
            </Match>
            <Match
              when={attribute.componentName === "Select" && !attribute.options}
            >
              {getSelectNameValue({
                attribute: attribute,
                graph: graph,
                info: info,
                setGraph: setGraph,
              })}
            </Match>

            <Match
              when={
                attribute.componentName === "MultiSelect" && !attribute.options
              }
            >
              {getTagValue({
                attribute: attribute,
                graph: graph,
                info: info,
                setGraph: setGraph,
              })}
            </Match>

            <Match when={typeof info.getValue() === "boolean"}>
              <span>
                {info.getValue() === true
                  ? "Yes"
                  : info.getValue() === false
                    ? "No"
                    : ""}
              </span>
            </Match>
            <Match when={tableId === "File" && attribute.key === "fileName"}>
              <TooltipWrapper
                arrowCss={STYLES.tooltip.arrowCss}
                content={
                  <As as="div" css={STYLES.tooltip.contentCss}>
                    <ImageWrapper
                      alt="Preview"
                      css={`return \`._id {
                        border-radius: 4px;
                        height: 200px;
                        object-fit: cover;
                      }\`;`}
                      src={getDownloadLink(info.row.original)}
                    />
                  </As>
                }
                triggerAs="span"
                triggerCss={`return \`._id {
                  display: flex;
                  align-items: center;
                }\`;`}
              >
                <As
                  as="span"
                  css={`return \`._id {
                  display: flex;
                  align-items: center;
                }\`;`}
                  class="filename-container"
                >
                  <As
                    as="a"
                    href={getDownloadLink(info.row.original)}
                    target="_blank"
                    rel="noopener noreferrer"
                    css={`return \`._id {
                      color: \${args.theme.var.color.primary};
                      text-decoration: none;
                      &:hover {
                        text-decoration: underline;
                      }
                    }\`;`}
                  >
                    {info.getValue<string>()}
                  </As>
                  <IconButton
                    icon="ph:copy"
                    css={`return \`._id {
                      color: \${args.theme.var.color.primary};
                      background-color: transparent;
                      border: none;
                      padding: 1px;
                      margin-left: 4px;
                      cursor: pointer;
                      opacity: 0;
                      transition: opacity 0.2s;
                      .filename-container:hover & {
                        opacity: 1;
                      }
                      &:hover {
                        color: \${args.theme.var.color.primary_dark_400};
                      }
                    }\`;`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = getDownloadLink(info.row.original);
                      navigator.clipboard.writeText(url);

                      // Show feedback that copy was successful
                      const button = e.currentTarget;
                      const iconElement = button.querySelector("iconify-icon");
                      const originalIcon = iconElement?.getAttribute("icon");

                      if (iconElement) {
                        iconElement.setAttribute("icon", "ph:check");

                        setTimeout(() => {
                          iconElement.setAttribute(
                            "icon",
                            originalIcon || "ph:copy",
                          );
                        }, 1500);
                      }
                    }}
                    size={16}
                  />
                </As>
              </TooltipWrapper>
            </Match>
            <Match when={true}>{info.getValue<string>()}</Match>
          </Switch>
        );
      });
    column.header = () =>
      capitalizeFirstLetter(
        attribute.title ||
          attribute.label ||
          attribute.displayName ||
          attribute.key,
      );
    column.footer = () =>
      capitalizeFirstLetter(
        attribute.title || attribute.displayName || attribute.key,
      );
    tableColumns.push(column);
  }

  // Check if any actions are available before adding the Actions column
  const hasEditAction =
    !hideEditAction &&
    (gridState.isNoPermissionCheck ||
      (gridState.formMetaData() &&
        (gridState.hasEditPermission() || gridState.hasViewPermission())));

  const hasDeleteAction =
    !hideDeleteAction &&
    (gridState.isNoPermissionCheck ||
      (gridState.formMetaData() && gridState.hasFullPermission()));

  const hasFormAction = tableId === "Page";

  const hasJsonAction = !(hideEditJsonAction || FormMetaData[tableId]);

  // Only add Actions column if at least one action is available
  if (hasEditAction || hasDeleteAction || hasFormAction || hasJsonAction) {
    tableColumns.push({
      accessorKey: "Actions",
      cell: (info) => {
        return (
          <As
            as="div"
            css={`return \`._id {
            ${formNew.isInlineEditable ? "" : "padding: 0.25rem 0; border-radius: 7px;"}
            display: flex;
            align-items: center;
            gap: 4px;
            justify-content: center;
          }\`;`}
          >
            <Show
              when={
                !hideEditAction &&
                (gridState.isNoPermissionCheck ||
                  (gridState.formMetaData() &&
                    (gridState.hasEditPermission() ||
                      gridState.hasViewPermission())))
              }
            >
              <Switch>
                <Match when={formNew.isInlineEditable && !gridState.editSchema}>
                  No Schema Found
                </Match>
                <Match when={formNew.isInlineEditable}>
                  <SchemaRenderer
                    form={gridState.editSchema!}
                    formDataId={info.row.original.id}
                  />
                </Match>
                <Match when={true}>
                  <IconButton
                    disabled={
                      !gridState.isNoPermissionCheck &&
                      !!gridState.formMetaData() &&
                      !(
                        gridState.hasEditPermission() ||
                        gridState.hasViewPermission()
                      )
                    }
                    icon="ph:pen"
                    css={`return \`._id {
                      color: \${args.theme.var.color.primary};
                      background-color: transparent;
                      border: none;
                      padding: 1px;
                      cursor: pointer;
                      &:hover {
                        color: \${args.theme.var.color.primary_dark_400};
                      }
                      &:disabled {
                        color: \${args.theme.var.color.text_light_600};
                        cursor: not-allowed;
                      }
                    }\`;`}
                    onClick={() => {
                      return navigate(
                        `/admin/${tableId}/${info.row.original.id}`,
                      );
                    }}
                    size={21}
                  />
                </Match>
              </Switch>
            </Show>

            <Show
              when={
                !hideDeleteAction &&
                (gridState.isNoPermissionCheck ||
                  (!!gridState.formMetaData() && gridState.hasFullPermission()))
              }
            >
              <IconButton
                disabled={
                  !gridState.isNoPermissionCheck &&
                  !!gridState.formMetaData() &&
                  !gridState.hasFullPermission()
                }
                icon="ph:trash"
                css={`return \`._id {color: \${args.theme.var.color.error};
                  background-color: transparent;
                  border: none;
                  padding: 1px;
                  cursor: pointer;
                  &:hover {
                    color: \${args.theme.var.color.error_dark_400};
                  }
                }\`;`}
                onClick={() => setDeleteRowId(info.row.original.id)}
                size={22}
              />
            </Show>

            <Show when={tableId === "Page"}>
              <IconButton
                icon="ph:database"
                css={`return \`._id {
                  color: \${args.theme.var.color.primary};
                  background-color: transparent;
                  border: none;
                  padding: 1px;
                  cursor: pointer;
                  &:hover {
                    color: \${args.theme.var.color.primary_dark_400};
                  }
                }\`;`}
                onClick={() => {
                  const newUrl = `/admin/${info.row.original.P.key}`;
                  window.open(newUrl, "_blank");
                }}
                size={21}
              />
            </Show>
            <Show when={!(hideEditJsonAction || FormMetaData[tableId])}>
              <ModifyJsonButton
                css={`return \`._id {
                  color: \${args.theme.var.color.warning};
                  background-color: transparent;
                  border: none;
                  padding: 1px;
                  cursor: pointer;
                  &:hover {
                    color: \${args.theme.var.color.warning_dark_400};
                  }
                }\`;`}
                item={info.row.original}
                size={21}
              />
            </Show>
          </As>
        );
      },
      footer: "",
      header: "Actions",
    });
  }
  return tableColumns;
}
