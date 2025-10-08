import {
  type JSX,
  Match,
  Show,
  splitProps,
  Switch,
  createMemo,
  For,
  createUniqueId,
  Component, useContext,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { untrack } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Link, Meta, Title, Base, Style, useHead } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import type { FormStoreObject } from "../form/context/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { evalExpression } from "~/lib/expression_eval";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import type { ServerResult } from "~/cypher/types/ServerResult";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { executeServerFunction } from "~/cypher/get/executeServerFunction";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { DataInternal } from "./data/DataInternal";
import { As } from "~/components/As";
import {SolidMarkdown} from "~/components/solid-markdown";
import remarkGfm from "remark-gfm";
import {SlotContext} from "~/components/fields/component/contexts/SlotContext";
const MetaTag = (
  tag: string,
  props: { [k: string]: any },
  setting?: { escape?: boolean; close?: boolean },
) => {
  useHead({
    tag,
    props,
    setting,
    id: createUniqueId(),
    get name() {
      return props.name || props.property;
    },
  });

  return null;
};

export const Script: Component<JSX.ScriptHTMLAttributes<HTMLScriptElement>> = (
  props,
) => MetaTag("script", props, { close: true });

export function replacePlaceholderWithUrl(
  value: string,
  edgeName: string,
  data: Vertex,
  graph: GraphInterface,
): string {
  if (!value) return "";
  if (!value.includes("$1")) {
    return value;
  }

  const files =
    evalExpression(`->${edgeName}`, {
      graph,
      setGraph: () => {},
      vertexes: [data],
    }) || [];

  if (files.length === 0) {
    return value;
  }

  const file = files[0];
  return value.replaceAll("$1", getDownloadLink(file));
}

// HtmlField
// Helper function to parse serverFunction and extract accessed properties and function calls
function parseContextAccess(functionBody: string): { properties: string[], functionCalls: Array<{match: string, property: string}> } {
  const properties: string[] = [];
  const functionCalls: Array<{match: string, property: string}> = [];
  
  // Match function calls like args.contextData.propertyName()
  const functionRegex = /args\.contextData\.(\w+)\(\)|args\.contextData\[['"]([^'"]+)['"]\]\(\)/g;
  
  let match;
  while ((match = functionRegex.exec(functionBody)) !== null) {
    const property = match[1] || match[2];
    if (property) {
      functionCalls.push({
        match: match[0],
        property: property
      });
    }
  }
  
  // Match property access (non-function)
  // This regex captures:
  // 1. args.contextData.propertyName (dot notation, not followed by parentheses)
  // 2. args.contextData['propertyName'] (bracket notation with single quotes, not followed by parentheses)
  // 3. args.contextData["propertyName"] (bracket notation with double quotes, not followed by parentheses)
  const propertyRegex = /args\.contextData\.(\w+)(?!\()|args\.contextData\[['"]([^'"]+)['"]\](?!\()/g;
  
  match = null;
  while ((match = propertyRegex.exec(functionBody)) !== null) {
    // match[1] is for dot notation, match[2] is for bracket notation
    const property = match[1] || match[2];
    if (property && !properties.includes(property)) {
      properties.push(property);
    }
  }
  
  return { properties, functionCalls };
}

// Helper function to create a new context object from the proxy and process function body
function createContextObject(contextData: any, functionBody: string): { context: any, processedFunctionBody: string } {
  // Parse the function to find properties and function calls
  const { properties, functionCalls } = parseContextAccess(functionBody);
  
  // Create a new object with only the accessed properties
  const newContext: any = {};
  
  for (const prop of properties) {
    newContext[prop] = contextData[prop];
  }
  
  // Process function calls and replace them with their values
  let processedFunctionBody = functionBody;
  
  for (const { match, property } of functionCalls) {
    if (typeof contextData[property] === 'function') {
      try {
        const result = contextData[property]();
        // Replace the function call with its result (properly stringified)
        processedFunctionBody = processedFunctionBody.replace(
          match,
          JSON.stringify(result)
        );
      } catch (error) {
        console.error(`Error calling contextData.${property}():`, error);
        // If function call fails, leave it as is
      }
    }
  }
  
  return { context: newContext, processedFunctionBody };
}

export function HtmlField(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    as?: string;
    childrenBefore?: boolean;
    class?: string;
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
    src?: string;
    text?: string;
    textType?: string; // "markdown" or undefined
    // DataField props
    data?: (() => unknown[]) | unknown[];
    expression?: string;
    loop?: boolean;
    contextName?: string;
    // Server function props
    serverFunction?: string; // Function body as string
    renderChildren?: boolean;
  },
) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data;
  const contextData = useDataContext() || {};
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const [previewStore] = usePreviewContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "children",
    "text",
    "textType",
    "childrenBefore",
    // DataField props
    "data",
    "expression",
    "loop",
    "contextName",
    // Server function props
    "serverFunction",
  ]);

  const asLowerCase = createMemo(() => local.as?.toLowerCase());

  const DataField = () => {
    // DataField logic - Fetch data if expression is provided and no static data
    const selectionOptionsData = createAsync<ServerResult>(
      async () => {
        if ((!local.expression && !local.serverFunction) || local.data) {
          // Return empty result when no fetch is needed
          return {
            success: true,
          } as ServerResult;
        }

        // If serverFunction is provided, execute it
        if (local.serverFunction) {
          const { context, processedFunctionBody } = createContextObject(contextData, local.serverFunction);
          return executeServerFunction(
            {
              functionBody: processedFunctionBody,
              contextData: context,
            },
            {
              nodes: {},
              relationships: {},
              vertexes: data() ? [data()!] : [],
            },
          );
        }

        // Otherwise, use expression-based fetch
        return fetchDataFromDB(
          { expression: local.expression },
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
        if (local.data) {
          return {
            options:
              typeof local.data === "function" ? local.data() : local.data,
            error: null,
          };
        }

        // If no expression or server function, return empty
        if (!local.expression && !local.serverFunction) {
          return { options: [], error: null };
        }

        const fetchedData = selectionOptionsData();

        // Still loading
        if (fetchedData === undefined) {
          return { options: [], error: null };
        }

        // Process fetched data
        if (isValidResponse(fetchedData)) {
          // Update graph data if present
          if (fetchedData.graph) {
            setGraphData(graph, setGraph, fetchedData.graph, {
              skipExisting: true,
            });
          }

          // For server function, use the result directly
          if (local.serverFunction && fetchedData.result !== undefined) {
            return { options: fetchedData.result, error: null };
          }

          // For expression, evaluate it
          if (local.expression) {
            const evaluatedData =
              evalExpression(local.expression, {
                graph,
                setGraph,
                vertexes: contextData || [],
              }) || [];

            return { options: evaluatedData, error: null };
          }
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
              css={`return \` ._id {
                  background-color: \${args.theme.var.color.error};
                  color: \${args.theme.var.color.error_text};
              }

                  \`;`}
            >
              {processedData().error}
            </As>
          </Match>
          <Match when={Array.isArray(processedData().options) && local.loop}>
            <For each={processedData().options}>
              {(value, index) => {
                return (
                  <DataInternal
                    data={data()}
                    index={index()}
                    meta={meta()!}
                    contextName={local.contextName!}
                    repeaterValue={value}
                  />
                );
              }}
            </For>
          </Match>
          <Match when={processedData().options && local.contextName && props.renderChildren}>
            <DataInternal
              data={data()}
              index={0}
              meta={meta()!}
              contextName={local.contextName!}
              repeaterValue={processedData().options}
              children={local.children}
              renderChildren
            />
          </Match>
          <Match when={processedData().options && local.contextName}>
            <DataInternal
              data={data()}
              index={0}
              meta={meta()!}
              contextName={local.contextName!}
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

  const handleTextChange = (e: Event) => {
    if (!layoutStoreId) {
      return;
    }

    const target = e.target as HTMLSpanElement;
    const txnId = formStoreVertex()?.P.txnId;
    const metaVertex = meta();
    if (
      formStoreVertex()?.P.selectedId !== -1 &&
      target.textContent !== local.text &&
      txnId &&
      metaVertex
    ) {
      untrack(() => {
        mergeVertexProperties(txnId, metaVertex.id, graph, setGraph, {
          text: target.textContent,
        });
      });
      saveUndoPoint(txnId, graph, setGraph);
    }
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      handleTextChange(e);
      // manually update the text, if changed
      if (local.text !== (e.target as HTMLElement).textContent) {
        (e.target as HTMLElement).textContent = local.text ?? "";
      }
    }
  };

  const Content = () => {
    const TextContent = () => {
      return (

              <Show
                when={local.textType === "markdown"}
                fallback={local.text}
              >
                <SolidMarkdown renderingStrategy="reconcile" remarkPlugins={[remarkGfm]}>
                  {local.text}
                </SolidMarkdown>
              </Show>

      );
    };

    // note: text property will not work when using the data field
    return (
      <Switch>
        <Match when={local.expression || local.data || local.serverFunction}>
          <DataField />
        </Match>
        <Match when={true}>
          <Show when={local.childrenBefore}>{local.children}</Show>
          <TextContent />
          <Show when={!local.childrenBefore}>{local.children}</Show>
        </Match>
      </Switch>
    );
  };

  return (
    <Switch>
      <Match when={!local.as || asLowerCase() === "fragment"}>
        <Content />
      </Match>
      <Match when={asLowerCase() === "img"}>
        <img
          class={`${local.class || ""}`}
          loading="lazy"
          {...(others as JSX.ImgHTMLAttributes<HTMLImageElement>)}
          src={replacePlaceholderWithUrl(
            others.src ?? "",
            "$0Src",
            meta(),
            graph,
          )}
        />
      </Match>
      <Match when={asLowerCase() === "icon"}>
        {/* @ts-expect-error - icon wiil be in others */}
        <Icon class={`${local.class || ""}`} noobserver {...others} />
      </Match>
      <Match when={asLowerCase() === "base"}>
        <Base {...others} />
      </Match>

      <Match when={asLowerCase() === "link"}>
        <Link {...others} />
      </Match>

      <Match when={asLowerCase() === "meta"}>
        <Meta {...others} />
      </Match>

      <Match when={asLowerCase() === "style"}>
        <Style>{local.text}</Style>
      </Match>

      <Match when={asLowerCase() === "title"}>
        <Title>{local.text}</Title>
      </Match>

      <Match when={asLowerCase() === "script"}>
        <Script {...others}>{local.text}</Script>
      </Match>

      <Match when={asLowerCase() === "portal"}>
        <Portal {...others}>
          <Content />
        </Portal>
      </Match>
      <Match when={asLowerCase() === "slot"}>
        <Content/>
      </Match>
      <Match when={true}>
        <Dynamic
          class={`${local.class || ""}`}
          component={local.as || "div"}
          {...others}
        >
          <Content />
        </Dynamic>
      </Match>
    </Switch>
  );
}
