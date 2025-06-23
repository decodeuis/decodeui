import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import { evalExpression } from "~/lib/expression_eval";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface ParentButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function ParentButton(props: Readonly<ParentButtonProps>) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.defaultCss,
        ...ensureArray(props.css),
        `return \`._id {
          background-color: transparent;
          border: none;
        }\`;`,
      ]}
      icon="ph:arrow-up"
      onClick={(e) => {
        e.stopPropagation();
        const parentResult = evalExpression("<-Attr", {
          graph,
          vertexes: [props.item],
        });
        if (!parentResult?.[0]) {
          return;
        }
        onLayoutItemClick(
          layoutStoreVertex(),
          formStoreVertex()!,
          parentResult[0].id,
          graph,
          setGraph,
        );
      }}
      size={props.size}
      title="Select Parent"
    />
  );
}
