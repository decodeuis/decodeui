import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";

import { useDesignerFormIdContext } from "../../../context/LayoutContext";
import { Label } from "./Label";

import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { isUniqueIdUsed } from "~/features/page_designer/functions/form/isUniqueIdUsed";

export function UniqueNameField(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  function setUniqueNameValue(metaVertex: Vertex, data: string) {
    if (metaVertex.P.key === uniqueNameKey) {
      if (data.length) {
        if (
          isUniqueIdUsed(
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId!],
            props.selectedLayout,
            data,
          )
        ) {
          mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: "Name is not unique",
          });
        } else {
          mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: null,
          });
        }
      } else {
        mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: "Name is required",
        });
      }
    } else {
      mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
        error: null,
      });
    }
    props.onChange(metaVertex, data);
  }

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
}\`;`}
      >
        <DynamicComponent
          data={props.selectedLayout}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={props.meta}
          noLabel
          onChange={(data: string) => setUniqueNameValue(props.meta, data)}
          txnId={0}
        />
      </As>
    </As>
  );
}
