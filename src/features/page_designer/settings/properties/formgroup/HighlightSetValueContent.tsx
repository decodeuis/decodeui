import { createMemo, Match, Show, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { IframeHelpDialog } from "~/components/styled/modal/IframeHelpDialog";
import { FilePickerButton } from "~/components/file_picker/FilePickerButtonImageSrc";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { evalExpression } from "~/lib/expression_eval";

import { DefaultValueContent } from "./DefaultValueContent";
import { Label } from "./Label";
import { As } from "~/components/As";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function HighlightSetValueContent(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: unknown) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const selectedAttr = () => graph.vertexes[formStoreVertex().P.selectedId];
  const componentExample = createMemo(
    () =>
      evalExpression("->$0CompExample", {
        graph,
        setGraph,
        vertexes: [props.meta],
      }) || [],
  );

  return (
    <As
      as="div"
      css={[
        `return \`._id {
          display: flex;
          align-items: center;
          gap: 2px;
          justify-content: space-between;
          margin-top: 6px;
        }\`;`,
        props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
        props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
          ? `return \`._id {
              border: 2px solid \${args.theme.var.color.success};
              border-bottom: none;
              border-top: none;
              padding: 2px 3px;
              border-radius: 5px;
            }\`;`
          : "",
      ]}
    >
      <As
        as="span"
        css={`return \`._id {
  font-size: 15px;
  flex: 0.5;
}\`;`}
      >
        <Label meta={props.meta} />
      </As>
      <As
        as="span"
        css={`return \`._id {
  font-size: 15px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}\`;`}
      >
        <div style={{ flex: "1" }}>
          <Switch>
            <Match when={props.meta.P.key === "defaultValue"}>
              <DefaultValueContent
                meta={props.meta}
                onChange={props.onChange}
                selectedLayout={props.selectedLayout}
                txnId={props.txnId}
              />
            </Match>
            <Match when={componentExample().length > 0}>
              <PageAttrRender
                data={props.selectedLayout}
                isNoPermissionCheck={true}
                metaVertex={componentExample()[0]}
              />
            </Match>
            <Match
              when={
                // selectedAttr()?.P.componentName === "Image" &&
                props.meta.P.key === "src"
              }
            >
              <div>
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 2px;
}\`;`}
                >
                  <DynamicComponent
                    data={props.selectedLayout}
                    isNoPermissionCheck={true}
                    isRealTime={false}
                    meta={props.meta}
                    noLabel
                    onChange={(data) => props.onChange(props.meta, data)}
                    txnId={props.txnId}
                  />
                  <FilePickerButton
                    handleChange={(value) => props.onChange(props.meta, value)}
                    meta={props.selectedLayout}
                    value={props.selectedLayout.P.src}
                  />
                </As>
              </div>
            </Match>
            <Match
              when={
                selectedAttr()?.P.componentName === "Html" &&
                selectedAttr()?.P.as === "icon" &&
                props.meta.P.key === "icon"
              }
            >
              <div>
                <As
                  as="div"
                  css={`return \`._id {
  display: flex;
  gap: 2px;
}\`;`}
                >
                  <DynamicComponent
                    data={props.selectedLayout}
                    isNoPermissionCheck={true}
                    isRealTime={false}
                    meta={props.meta}
                    noLabel
                    onChange={(data) => props.onChange(props.meta, data)}
                    txnId={props.txnId}
                  />
                  <IframeHelpDialog
                    icon="arcticons:pickme"
                    iframeSrc="https://icon-sets.iconify.design"
                    iframeTitle="Icon Sets"
                    title="Icon Picker"
                  />
                </As>
              </div>
            </Match>
            <Match when={true}>
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
          </Switch>
        </div>
        <Show
          when={
            props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
            props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
          }
        >
          <IconButton
            data-testid="clearIcon"
            icon="ph:x"
            css={`return \`._id {
              background-color: transparent;
              border: none;
            }\`;`}
            iconCss={`return \`._id {color:\${args.theme.var.color.error}; cursor:pointer;}\`;`}
            onClick={() => props.onChange(props.meta, null)}
            size={24}
          />
        </Show>
      </As>
    </As>
  );
}
