import { toTitle } from "case-switcher-js";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  Match,
  onCleanup,
  runWithOwner,
  Show,
  Switch,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useFormContext } from "~/components/form/context/FormContext";
import { AddNewButton } from "~/features/grid/header/AddNewButton";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getDataVertex } from "~/features/page_attr_render/functions/getDataVertex";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { sortVertexesByPosition } from "~/lib/graph/get/sync/entity/sortVertexesByPosition";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { getSublistRows } from "~/lib/graph/mutate/form/addNewRow";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { STYLES } from "~/pages/settings/constants";

import { insertNewRow } from "./functions/insertNewRow";
import { SortableRow } from "./row/SortableRow";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function TableInputField(
  props: Readonly<{
    addNewButtonText?: string;
    data?: Vertex;
    hideAddButton?: boolean;
    isNoPermissionCheck?: boolean;
    isRealTime?: boolean;
    isTableInside?: boolean;
    meta?: Vertex;
    onAddRef?: (addRowFn: () => void) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => props.meta ?? parentRenderContext()?.context.meta;
  const data = () => props.data ?? parentRenderContext()?.context.data;

  const metaVertexId = `${generateNewVertexId(graph, setGraph)}-meta`;
  const metaTxnId = generateNewTxnId(graph, setGraph);
  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["TableMeta"], { rows: {} }),
    graph,
    setGraph,
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  const tableColumnsTemplate = createMemo(() =>
    sortVertexesByPosition(
      evalExpression("->Attr", {
        graph,
        setGraph,
        vertexes: [meta()!],
      }) || [],
    ),
  );

  const parentData = createMemo(() =>
    getDataVertex(graph, getLastItem(parentItems, 1)?.[0].context.data),
  );

  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(graph, meta()!, data() || parentData());
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<null | number>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<null | number>(null);

  const handleDrop = () => {
    if (
      dragFromIndex() !== null &&
      dragToIndex() !== null &&
      dragFromIndex() !== dragToIndex()
    ) {
      const updatedRows = [...sortedVertexes()];
      const [draggedRow] = updatedRows.splice(dragFromIndex()!, 1);
      updatedRows.splice(dragToIndex()!, 0, draggedRow);
      setSortedVertexes(updatedRows);
      for (const [index, vertex] of updatedRows.entries()) {
        mergeVertexProperties(
          formVertex().P.txnId!,
          vertex.id,
          graph,
          setGraph,
          {
            displayOrder: index + 1,
          },
        );
      }
    }
    setDragFromIndex(null);
    setDragToIndex(null);
  };
  const owner = getOwner();

  const addNewRow = () => {
    runWithOwner(owner, () =>
      insertNewRow(
        formVertex().P.txnId || 0,
        meta()!,
        data()!,
        props.isRealTime ?? false,
        graph,
        setGraph,
      ),
    );
  };

  // Expose add row function if onAddRef is provided
  if (props.onAddRef) {
    props.onAddRef(() => addNewRow);
  }

  return (
    <Switch>
      <Match when={tableColumnsTemplate().length === 0}>
        Please Define table columns
      </Match>
      <Match when={true}>
        {/*<Show when={meta().P.attributes}>*/}
        {/*  <FormGroup form={{title: '', label: meta().P.title || meta().P[IdAttr], attributes: meta().P.attributes}} vertex={vertex}/>*/}
        {/*</Show>*/}
        {/* <Show when={props.isTableInside}> */}
        <Show when={!props.hideAddButton}>
          <AddNewButton
            buttonText={props.addNewButtonText}
            onClick={addNewRow}
          />
        </Show>
        {/* </Show> */}
        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
        <As
          as="div"
          css={[
            `return \`._id {
  margin: 2px;
  border-radius: 10px;
  ${sortedVertexes().length > 0 ? "border: 1px solid ${args.theme.var.color.primary};" : ""}
}\`;`,
            STYLES.overflowCss,
          ]}
        >
          <As
            as="table"
            css={`return \`._id {
  border: none;
  border-collapse: collapse;
  border-radius: 0.4rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-size: 0.9em;
  ${props.isTableInside ? "width: -webkit-fill-available;" : ""}
}\`;`}
          >
            <Show when={sortedVertexes().length}>
              <thead>
                <As
                  as="tr"
                  css={`return \`._id {
  background-color: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  height: 35px;
  text-align: center;
  width: max-content;
}\`;`}
                >
                  <As
                    as="td"
                    css={`return \`._id {
  text-align: center;
  align-content: center;
  align-items: center;
  color: \${args.theme.var.color.primary_text};
  font-weight: 500;
  padding: 0 10px;
  text-align: left;
}\`;`}
                  >
                    &nbsp;Actions
                  </As>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => (
                      <Switch>
                        {/*<Match when={attribute.P.skip}></Match>*/}
                        <Match when={attribute.P.tab === "expand"}>
                          <span />
                        </Match>
                        <Match
                          when={!attribute.P.hide || attribute.P.defaultValue}
                        >
                          <As
                            as="th"
                            css={`return \`._id {
  font-weight: 500;
  justify-content: center;
  padding: 0 10px;
}\`;`}
                          >
                            {toTitle(
                              attribute.P.label ||
                                attribute.P.displayName ||
                                attribute.P[IdAttr] ||
                                "",
                            )}
                            {/* Add Proper Validation check */}
                            {attribute.P.validation?.required && (
                              <As
                                as="span"
                                css={`return \`._id {
  color: \${args.theme.var.color.error};
}\`;`}
                              >
                                {" "}
                                *
                              </As>
                            )}
                          </As>
                        </Match>
                        <Match when={true}>
                          <th />
                        </Match>
                      </Switch>
                    )}
                  </For>
                </As>
              </thead>
            </Show>
            <tbody>
              <For each={sortedVertexes()}>
                {(vertex, index) => (
                  <SortableRow
                    dragFromIndex={dragFromIndex}
                    dragToIndex={dragToIndex}
                    handleDrop={handleDrop}
                    isNoPermissionCheck={
                      props.isNoPermissionCheck ??
                      parentRenderContext()?.context.isNoPermissionCheck
                    }
                    isRealTime={props.isRealTime ?? false}
                    joinVertex={vertex}
                    meta={meta()!}
                    metaInstance={graph.vertexes[metaVertexId]}
                    // onChange={props.onChange}
                    rowIndex={index()}
                    setDragFromIndex={setDragFromIndex}
                    setDragToIndex={setDragToIndex}
                    tableColumnsTemplate={tableColumnsTemplate}
                    txnId={formVertex().P.txnId ?? 0}
                  />
                )}
              </For>
            </tbody>
          </As>
        </As>
        {/*<Show when={Page}>*/}
        {/*  <For each={Object.values(Page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}
