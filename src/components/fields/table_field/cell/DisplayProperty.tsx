import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import {
  type Accessor,
  createComputed,
  createMemo,
  getOwner,
  Match,
  on,
  runWithOwner,
  Show,
  Switch,
} from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { evalExpression } from "~/lib/expression_eval";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../form/context/FormContext";
import { DefaultValue } from "./DefaultValue";
import { As } from "~/components/As";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const getComponentClass = (componentName: string) => {
  switch (componentName) {
    // case "CheckBox":
    //   return "min-width:50px;";
    case "Select":
      return "min-width:200px;";
    case "TextArea":
      return "min-width:200px;";
    case "Table":
    case "DynamicTable":
      return "min-width:250px;";
    default:
      return "min-width:150px;";
  }
};

// Component to display individual properties
export function DisplayProperty(
  props: Readonly<{
    column: Vertex;
    disabled: Accessor<boolean>;
    isNoPermissionCheck?: boolean | null;
    isRealTime: boolean;
    joinVertex: Vertex;
    // onChange?: (data: any) => void;
    txnId: number;
  }>,
) {
  const formId = useFormContext();
  const [graph, setGraph] = useGraph();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const metaVertex = createMemo(() => props.column);
  const outerOwner = getOwner();

  const [componentName, setComponentName] = createWritableMemo(() =>
    getComponent(props.column),
  );

  function getComponent(column: Vertex) {
    const componentNameValue = getComponentLabel(graph, column);
    if (componentNameValue?.includes("::")) {
      createComputed(
        on(
          () =>
            evalExpression(componentNameValue, {
              graph,
              setGraph,
              vertexes: [props.joinVertex],
            }),
          async (value) => {
            // to avoid error:  ReferenceError: Cannot access 'setComponentName' before initialization
            setTimeout(() => {
              runWithOwner(outerOwner, () => {
                setComponentName(value || "SystemTextInput");
              });
            });
            let componentNameNew = "";
            if (formVertex()?.P.txnId) {
              const res = await fetchDataFromDB(
                { expression: componentNameValue },
                {
                  nodes: {},
                  relationships: {},
                  vertexes: [props.joinVertex],
                },
              );
              if (isValidResponse(res) && typeof res.result === "string") {
                componentNameNew = res.result;
              } else {
                componentNameNew = value;
              }
            } else {
              componentNameNew = value;
            }
            if (!componentNameNew) {
              componentNameNew = "SystemTextInput";
            }
            setTimeout(() => {
              runWithOwner(outerOwner, () => {
                setComponentName(componentNameNew);
              });
            });
          },
        ),
      );
    } else {
      return componentNameValue;
    }
  }

  const Content = () => (
    <>
      <Show when={componentName() === "Error"}>Error</Show>
      <DynamicComponent
        // Dynamic component only supported on table
        componentName={componentName()}
        data={props.joinVertex}
        disabled={props.disabled()}
        isLabelWrap={false}
        isNoPermissionCheck={props.isNoPermissionCheck}
        isRealTime={props.isRealTime}
        // TODO: Remove this prop
        isTableInside={false}
        // When we have a Table we pass original Table Meta Vertex
        meta={metaVertex()}
        noLabel={true}
        // we cant use props.onChange in table cell, let dynamic component use its own onChange for the data.
        // onChange={props.onChange}
        title={toTitle(
          props.column.P.displayName || props.column.P[IdAttr] || "",
        )}
        txnId={props.txnId}
      />
    </>
  );

  return (
    <Switch>
      <Match when={metaVertex().P.hide}>
        <As
          as="td"
          css={`return \`._id {
  align-content: center;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
            ${getComponentClass(componentName()!)}
            display: flex;
            align-items: center;
            justify-content: center;
}\`;`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
          </As>
        </As>
      </Match>
      <Match
        when={componentName() === "Table" || componentName() === "DynamicTable"}
      >
        <As
          as="td"
          css={`return \`._id {
  ${getComponentClass(componentName()!)}
  text-align: left;
  padding: 1px;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  width: 100%;
}\`;`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
            <Content />
          </As>
        </As>
      </Match>
      <Match when={true}>
        <As
          as="td"
          css={`return \`._id {
  ${getComponentClass(componentName()!)}
  align-content: center;
  padding: 1px;
}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
  align-items: center;
}\`;`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
            <Content />
          </As>
        </As>
      </Match>
    </Switch>
  );
}
