import type { SetStoreFunction } from "solid-js/store";

import {
  type Accessor,
  createMemo,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";
import { createUniqueId } from "~/lib/solid/createUniqueId";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { isObject } from "~/lib/data_structure/object/isObject";
import { htmlTagsTree } from "~/lib/dom/htmlTags";
import { cloneVertexWithEdges } from "~/lib/graph/get/sync/entity/cloneVertexWithEdges";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/expression/getPropsFromMetaExpression";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { PROPERTIES } from "~/pages/settings/constants";
import { evalExpression } from "~/lib/expression_eval";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../../context/LayoutContext";
import { ValidationConfig } from "../validations/ValidationConfig";
import { HighlightSetValueContent } from "./HighlightSetValueContent";
import { Label } from "./Label";
import { SelectPermissionField } from "./permission_field/SelectPermissionField";
import { SelectPageField } from "./SelectPageField";
import { UniqueNameField } from "./UniqueNameField";
import { FunctionEditor } from "../FunctionEditor";
import { isPermissionsConfigurable } from "../../utils/permissionUtils";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  selectedLayout: Vertex;
  txnId: number;

  onChange(meta: Vertex, data: unknown): void;
}

interface PropertyFieldProps {
  meta: Vertex;
  metaTxnId: number;
  onChange: (meta: Vertex, data: unknown) => void;
  selectedLayout: Vertex;
  txnId: number;
}

export function createVertexIds() {
  return {
    as: `asVertex${createUniqueId()}`,
    layerName: `attrNameVertex${createUniqueId()}`,
    calculatedValue: `calculatedValueVertex${createUniqueId()}`,
    class: `classVertex${createUniqueId()}`,
    defaultValue: `defaultValueVertex${createUniqueId()}`,
    disabled: `disabledVertex${createUniqueId()}`,
    height: `heightVertex${createUniqueId()}`,
    hide: `hiddenVertex${createUniqueId()}`,
    icon: `iconVertex${createUniqueId()}`,
    key: `nameVertex${createUniqueId()}`,
    perm: `permissionVertex${createUniqueId()}`,
    required: `requiredVertex${createUniqueId()}`,
    slot: `slotVertex${createUniqueId()}`,
    src: `srcVertex${createUniqueId()}`,
    text: `textVertex${createUniqueId()}`,
    thankYouPage: `thankYouPageVertex${createUniqueId()}`,
    width: `widthVertex${createUniqueId()}`,
    name: `nameInputVertex${createUniqueId()}`,
    loop: `loopCheckboxVertex${createUniqueId()}`,
    expression: `expressionInputVertex${createUniqueId()}`,
  };
}

export function FormGroupProperties(props: Readonly<FormGroupPropertiesProps>) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const vertexIds = createVertexIds();
  const metaTxnId = generateNewTxnId(graph, setGraph);
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  const selectedAttr = () => graph.vertexes[formStoreVertex()?.P.selectedId];
  const _isHtmlIcon = () =>
    selectedAttr()?.P.componentName === "Html" &&
    selectedAttr()?.P.as === "icon";
  const propAttributes = createMemo(
    () =>
      clonePropAttributes(props.metaAttributes, metaTxnId, graph, setGraph) ??
      [],
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return (
    <>
      <div class="">
        <ValidationConfig
          componentName={selectedAttr()?.P.componentName}
          data={props.selectedLayout}
          meta={{ P: { key: "validation" } } as unknown as Vertex}
          onChange={props.onChange}
        />
      </div>
      <For
        each={getMetaVertexes(
          propAttributes(),
          vertexIds,
          graph,
          formStoreVertex,
        )}
      >
        {(meta) => (
          <PropertyField
            meta={meta}
            metaTxnId={metaTxnId}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        )}
      </For>
      <Show when={selectedAttr()?.P.componentName !== "Data"}>
        <FunctionEditor
          keyName="css"
          label="CSS"
          // language="css"
          language="javascript"
          returnType="string"
          setPropertyValue={props.onChange}
        />
        {/* <ClassesComponent
          metaAttributes={props.metaAttributes}
          onChange={props.onChange}
          selectedLayout={props.selectedLayout}
          txnId={props.txnId}
          vertexIds={vertexIds}
        /> */}
      </Show>
    </>
  );
}

function clonePropAttributes(
  metaAttributes: Vertex[],
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return metaAttributes?.map((vertex) => {
    return cloneVertexWithEdges(
      txnId,
      vertex,
      {
        // componentName: valueAttribute.componentName,
        // meta: valueAttribute.meta,
      },
      graph,
      setGraph,
    );
  });
}
function createVertices(
  vertexIds: ReturnType<typeof createVertexIds>,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const vertices: (Omit<Vertex, "IN" | "L" | "OUT"> & {
    attributes?: FieldAttribute[];
  })[] = [
    {
      id: vertexIds.key,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Unique Key",
        key: uniqueNameKey,
      },
    },
    {
      id: vertexIds.as,
      P: {
        componentName: "Select",
        displayName: "As",
        key: "as",
        // options: htmlTags.map((element) => ({ id: element, label: element })),
        options: htmlTagsTree.children,
        saveValue: true,
      },
    },
    {
      id: vertexIds.perm,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Permission",
        key: "perm",
      },
    },
    {
      id: vertexIds.calculatedValue,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Calculated Value Expr",
        key: "calculatedValue",
      },
    },
    {
      id: vertexIds.class,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Class",
        key: "class",
      },
    },
    {
      id: vertexIds.defaultValue,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Default Value",
        key: "defaultValue",
      },
    },
    {
      id: vertexIds.required,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Required Expr",
        key: "required",
      },
    },
    {
      id: vertexIds.hide,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Hidden Expr",
        key: "hide",
      },
    },
    {
      id: vertexIds.disabled,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Disabled Expr",
        key: "disabled",
      },
    },
    {
      id: vertexIds.thankYouPage,
      P: {
        componentName: "SystemTextInput",
        css: PROPERTIES.Css.TextFieldCss,
        displayName: "Thank You Page",
        key: "thankYouPage",
      },
    },
    {
      id: vertexIds.src,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Source",
        key: "src",
      },
    },
    // New vertices for icon, width, height, and attrName
    {
      id: vertexIds.icon,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Icon",
        key: "icon",
      },
    },
    {
      id: vertexIds.width,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Width",
        key: "width",
        type: "number",
      },
    },
    {
      id: vertexIds.height,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Height",
        key: "height",
        type: "number",
      },
    },
    {
      id: vertexIds.layerName,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Layer Name",
        key: "layerName",
      },
    },
    {
      id: vertexIds.text,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        type: "textarea",
        displayName: "Text",
        key: "text",
        name: "Text",
      },
    },
    {
      id: vertexIds.slot,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Slot Name",
        key: "slot",
      },
    },
    {
      id: vertexIds.name,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Name",
        key: "name",
      },
    },
    {
      id: vertexIds.loop,
      P: {
        componentName: "SystemTextInput",
        css: [PROPERTIES.Css.CheckBoxCss],
        type: "checkbox",
        displayName: "Loop",
        key: "loop",
      },
    },
    {
      id: vertexIds.expression,
      P: {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        displayName: "Expression",
        key: "expression",
      },
    },
  ];
  for (const vertex of vertices) {
    const newVertexInstance = newVertex(vertex.id, ["MetaTemp"], vertex.P);
    addNewVertex(txnId, newVertexInstance, graph, setGraph);
    if (vertex.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[vertex.id],
        vertex.attributes,
      );
    }
  }
}

function getMetaVertexes(
  vertices: Vertex[],
  vertexIds: ReturnType<typeof createVertexIds>,
  graph: GraphInterface,
  formStoreVertex: Accessor<Vertex<FormStoreObject>>,
) {
  const otherVertices =
    vertices?.filter(
      (vertex) => !Object.keys(vertexIds).includes(vertex.P.key),
    ) ?? [];
  const selectedAttr = () => graph.vertexes[formStoreVertex()?.P.selectedId];
  const componentName = selectedAttr()?.P.componentName;
  const isPage = formStoreVertex()?.L[0] === "Page";
  const isFormField =
    (isPage && selectedAttr()?.P.as === "input") ||
    selectedAttr()?.P.as === "textarea" ||
    selectedAttr()?.P.as === "select" ||
    ["MultiSelect", "Select", "SystemTextInput"].includes(componentName);
  const isHtmlIcon =
    componentName === "Html" && selectedAttr()?.P.as === "icon";
  const isDataComponent = componentName === "Data";

  // Check if parent component is a Slot
  const parentVertex = evalExpression("<-Attr", {
    graph,
    vertexes: [selectedAttr()],
  })?.[0];
  const isParentSlot = parentVertex?.P.componentName === "Component";

  // Check if the current component is a Slot
  const isCurrentComponentSlot = selectedAttr()?.P.componentName === "Slot";

  const nonCssVertices = otherVertices.filter(
    (vertex) => !vertex.P.key.endsWith("Css"),
  );

  const basicVertices = [
    graph.vertexes[vertexIds.key],
    graph.vertexes[vertexIds.layerName],
    ...(isPage && componentName === "Page"
      ? [graph.vertexes[vertexIds.thankYouPage]]
      : []),
    graph.vertexes[vertexIds.perm],
    ...(isFormField ? [graph.vertexes[vertexIds.defaultValue]] : []),
    // always displayed properties
    graph.vertexes[vertexIds.calculatedValue],
    ...(componentName === "Html" ? [graph.vertexes[vertexIds.as]] : []),
    ...(isDataComponent
      ? [
          graph.vertexes[vertexIds.name],
          graph.vertexes[vertexIds.loop],
          graph.vertexes[vertexIds.expression],
        ]
      : []),
    graph.vertexes[vertexIds.required],
    graph.vertexes[vertexIds.hide],
    graph.vertexes[vertexIds.disabled],
    ...(selectedAttr()?.P.as === "img" ? [graph.vertexes[vertexIds.src]] : []),
    ...(isHtmlIcon
      ? [
          graph.vertexes[vertexIds.icon],
          graph.vertexes[vertexIds.width],
          graph.vertexes[vertexIds.height],
        ]
      : []),
    ...(componentName === "Html" ? [graph.vertexes[vertexIds.text]] : []),
    ...(isParentSlot ? [graph.vertexes[vertexIds.slot]] : []),
    ...(isCurrentComponentSlot ? [graph.vertexes[vertexIds.slot]] : []),
    ...nonCssVertices,
  ];

  return basicVertices;
}

function PropertyField(props: Readonly<PropertyFieldProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId].P as PageLayoutObject) ?? {};

  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const metaProps = getPropsFromMetaExpression(
    graph,
    setGraph,
    props.meta,
    props.meta,
  );
  if (isObject(metaProps) && Object.keys(metaProps).length > 0) {
    mergeVertexProperties(
      props.metaTxnId,
      props.meta.id,
      graph,
      setGraph,
      metaProps,
    );
  }

  return (
    <div>
      <Switch>
        <Match when={props.meta.P.key === uniqueNameKey}>
          <UniqueNameField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.meta.P.key === "thankYouPage"}>
          <SelectPageField
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
        </Match>
        <Match
          when={
            props.meta.P.key === "required" ||
            props.meta.P.key === "hide" ||
            props.meta.P.key === "disabled" ||
            props.meta.P.key === "calculatedValue"
          }
        >
          {/*Dont use expression builder for now*/}
          <div>{/* Placeholder for future implementation */}</div>
          {/* <SelectRuleField
            meta={props.meta}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          /> */}
        </Match>
        <Match when={props.meta.P.key === "perm"}>
          <Show
            when={isPermissionsConfigurable(
              graph,
              formStoreVertex()?.P.formDataId,
            )}
          >
            <SelectPermissionField
              meta={props.meta}
              selectedLayout={props.selectedLayout}
              txnId={props.txnId}
            />
          </Show>
        </Match>
        <Match when={props.meta.P.componentName === "Table"}>
          <h3>
            <Label meta={props.meta} />
          </h3>
          <DynamicComponent
            data={props.selectedLayout}
            isNoPermissionCheck={true}
            isRealTime={false}
            meta={props.meta}
            noLabel
            onChange={(data) => props.onChange(props.meta, data)}
            txnId={props.txnId}
          />
        </Match>
        <Match when={props.selectedLayout}>
          <HighlightSetValueContent
            meta={props.meta}
            onChange={props.onChange}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          />
          {/* Temporary disabled */}
          {/* <SelectRuleField
            meta={modifyMetaVertexExpr(props.meta)}
            selectedLayout={props.selectedLayout}
            txnId={props.txnId}
          /> */}
        </Match>
      </Switch>
    </div>
  );
}
