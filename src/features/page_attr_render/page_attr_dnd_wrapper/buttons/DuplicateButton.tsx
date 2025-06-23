import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { cloneLayoutAndChildren } from "~/features/page_designer/functions/layout/cloneLayoutAndChildren";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface DuplicateButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

// unused
export function DuplicateButton(props: Readonly<DuplicateButtonProps>) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
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
      icon="ph:copy"
      onClick={(e) => {
        e.stopPropagation();
        cloneLayoutAndChildren(
          props.item,
          undefined,
          undefined,
          formStoreVertex()?.P.txnId,
          graph,
          setGraph,
          graph.vertexes[formStoreVertex()?.P.formDataId!],
        );
      }}
      size={props.size}
      title="Duplicate"
    />
  );
}
