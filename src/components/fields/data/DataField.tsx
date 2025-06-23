import { createAsync } from "@solidjs/router";
import { createMemo, For, Match, Show, Switch } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";

import { DataInternal } from "./DataInternal";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const DataField = (props: {
  data: (() => any[]) | any[];
  expression: string;
  loop: boolean;
  name: string;
}) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data;
  const contextData = useDataContext() || {};

  // Fetch data if expression is provided and no static data
  const selectionOptionsData = createAsync<ServerResult>(
    async () => {
      if (!props.expression || props.data) {
        // Return empty result when no fetch is needed
        return {
          success: true,
        } as ServerResult;
      }
      return fetchDataFromDB(
        { expression: props.expression },
        {
          nodes: {},
          relationships: {},
          vertexes: [data()!],
        },
      );
    },
    { deferStream: true },
  );

  const DataFieldInternal = () => {
    // Process the data based on props and fetched results
    const processedData = createMemo(() => {
      // If static data is provided, use it directly
      if (props.data) {
        return {
          options: typeof props.data === "function" ? props.data() : props.data,
          error: null,
        };
      }

      // If no expression, return empty
      if (!props.expression) {
        return { options: [], error: null };
      }

      const fetchedData = selectionOptionsData();

      // Still loading
      if (fetchedData === undefined) {
        return { options: [], error: null };
      }

      // Process fetched data
      if (isValidResponse(fetchedData) && fetchedData.graph) {
        setGraphData(graph, setGraph, fetchedData.graph, {
          skipExisting: true,
        });

        const evaluatedData =
          evalExpression(props.expression, {
            graph,
            setGraph,
            vertexes: contextData || [],
          }) || [];

        return { options: evaluatedData, error: null };
      }

      // Error case
      return {
        options: [],
        error: getErrorMessage(fetchedData),
      };
    });

    return (
      <Switch>
        <Match when={processedData().error}>
          <As
            as="div"
            css={`return \`._id {
  background-color: \${args.theme.var.color.error};
  color: \${args.theme.var.color.error_text};
}\`;`}
          >
            {processedData().error}
          </As>
        </Match>
        <Match when={Array.isArray(processedData().options) && props.loop}>
          <For each={processedData().options}>
            {(value, index) => {
              return (
                <DataInternal
                  data={data()}
                  index={index()}
                  meta={meta()!}
                  name={props.name}
                  repeaterValue={value}
                />
              );
            }}
          </For>
        </Match>
        <Match when={processedData().options}>
          <DataInternal
            data={data()}
            index={0}
            meta={meta()!}
            name={props.name}
            repeaterValue={processedData().options}
          />
        </Match>
      </Switch>
    );
  };

  return (
    <Show when={selectionOptionsData()}>
      <DataFieldInternal />
    </Show>
  );
};
