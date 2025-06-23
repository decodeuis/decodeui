import { type Accessor, createMemo, createSignal, For, Show } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { addNewRow } from "~/lib/graph/mutate/form/addNewRow";
import { deleteRow } from "~/lib/graph/mutate/vertex/delete/deleteRow";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../form/context/FormContext";
import { DisplayProperty } from "../cell/DisplayProperty";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const SortableRow = (
  props: Readonly<{
    dragFromIndex: Accessor<null | number>;
    dragToIndex: Accessor<null | number>;
    handleDrop: (event: DragEvent) => void;
    isNoPermissionCheck?: boolean | null;
    isRealTime: boolean;
    joinVertex: Vertex;
    meta: Vertex;
    metaInstance: Vertex;
    rowIndex: number;
    setDragFromIndex: (index: number) => void;
    setDragToIndex: (index: number) => void;
    tableColumnsTemplate: Accessor<Vertex[]>;
    txnId: number;
  }>,
) => {
  const [graph, setGraph] = useGraph();
  // if there is no parent FormContext, it should still work.
  const formId = useFormContext();
  const _formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const [expanded, setExpanded] = createSignal(true);
  const [disabled] = createSignal(false);

  const attributesResult = () => props.tableColumnsTemplate();

  const rowColumnsMetaAttrs = createMemo(
    () =>
      attributesResult()?.filter((vertex) => vertex.P.tab !== "expand") ?? [],
  );
  const expandVertex = createMemo(() =>
    attributesResult()?.find((vertex) => vertex.P.tab === "expand"),
  );

  const handleDragEnter = () => props.setDragToIndex(props.rowIndex);
  const handleDragOver = (event: DragEvent) => event.preventDefault();
  const handleDragStart = () => props.setDragFromIndex(props.rowIndex);
  const handleDeleteRow = () =>
    deleteRow(props.joinVertex, props.isRealTime, graph, setGraph, props.txnId);
  const handleAddNewRow = () =>
    addNewRow(
      props.txnId ?? 0,
      expandVertex()!,
      graph,
      setGraph,
      props.joinVertex,
      {},
      props.isRealTime ?? false,
    );
  const toggleExpanded = () => setExpanded(!expanded());

  return (
    <>
      <As
        as="tr"
        css={`return \`._id {
        border-bottom: 1px solid \${args.theme.var.color.background_light_400};
        border-radius: 10px;
        text-align: center;
        transition: background-color 0.2s ease;
        width: 50px;
        background-color: ${
          props.rowIndex === props.dragFromIndex()
            ? "${args.theme.var.color.background_light_300}"
            : props.rowIndex === props.dragToIndex()
              ? "${args.theme.var.color.background_light_200}"
              : "${args.theme.var.color.background}"
        };
        color: \${args.theme.var.color.text};
        border: ${
          props.rowIndex === props.dragToIndex()
            ? "2px solid ${args.theme.var.color.success}"
            : "1px solid ${args.theme.var.color.background_light_400}"
        };
      }\`;`}
        draggable={true}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDrop={props.handleDrop}
      >
        <td>
          <As
            as="div"
            css={`return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
}\`;`}
          >
            <IconButton
              css={`return \`._id {
  cursor: grab;
  background-color: transparent;
  border: none;
}\`;`}
              icon="material-symbols:drag-indicator"
              iconCss={`return \`._id {transition: transform 2s ease-in-out}\`;`}
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                css={`return \`._id {
  cursor: pointer;
  background-color: transparent;
  border: none;
}\`;`}
                icon={expanded() ? "ph:caret-right" : "ph:caret-down"}
                iconCss={`return \`._id {transition: transform 2s ease-in-out}\`;`}
                onClick={toggleExpanded}
                size={20}
              />
            </Show>
            <IconButton
              css={`return \`._id {
  color: \${args.theme.var.color.error};
  cursor: pointer;
  margin: 5px;
  background-color: transparent;
  border: none;
}\`;`}
              icon="mingcute:delete-line"
              onClick={handleDeleteRow}
              size={20}
            />
            <Show when={expandVertex()}>
              <IconButton
                css={`return \`._id {
  color: \${args.theme.var.color.success};
  cursor: pointer;
  background-color: transparent;
  border: none;
}\`;`}
                icon="icon-park-outline:plus"
                onClick={handleAddNewRow}
                size={20}
              />
            </Show>
          </As>
          {/*<Show when={!disabled}>*/}
          {/*  <Icon icon="material-symbols:edit"  noobserver onClick={() => setDisabled((v) => !v)} />*/}
          {/*</Show>*/}
        </td>
        <For each={rowColumnsMetaAttrs()}>
          {(column) => (
            <DisplayProperty
              column={column}
              disabled={disabled}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              joinVertex={props.joinVertex}
              // onChange={props.onChange}
              txnId={props.txnId}
            />
          )}
        </For>
      </As>
      {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
      {/* {evalExpression("->$0", {
        graph,
        vertexes: [props.joinVertex],
      })?.length} */}
      <Show when={expandVertex() && expanded()}>
        <As
          as="tr"
          css={`return \`._id {
  border-bottom: 1px solid \${args.theme.var.color.background_light_400};
  border-radius: 10px;
}\`;`}
        >
          <As
            as="td"
            css={`return \`._id {
  padding-left: 15px;
}\`;`}
            colspan={rowColumnsMetaAttrs().length + 2}
          >
            <DynamicComponent
              componentName={"DynamicTable"}
              data={props.joinVertex}
              disabled={disabled()}
              isNoPermissionCheck={props.isNoPermissionCheck}
              isRealTime={props.isRealTime}
              isTableInside={false}
              // When we have a Table we pass original Table Meta Vertex
              meta={expandVertex()!}
              // onChange={props.onChange}
            />
          </As>
        </As>
      </Show>
    </>
  );
};
