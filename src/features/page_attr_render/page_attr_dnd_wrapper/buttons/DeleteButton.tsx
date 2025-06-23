import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { deleteLayoutAttr } from "~/features/page_designer/functions/layout/deleteLayoutAttr";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface DeleteButtonProps {
  css?: CssType;
  componentName: string;
  item: Vertex;
  size: number;
}

export function DeleteButton(props: Readonly<DeleteButtonProps>) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast } = useToast();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();

  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <IconButton
      css={[
        ICON_BUTTON_STYLES.baseCss,
        ICON_BUTTON_STYLES.deleteCss,
        ...ensureArray(props.css),
        `return \`._id {
        color: \${args.theme.var.color.error};
        background-color: transparent;
        border: none;
      }\`;`,
      ]}
      icon="ph:trash"
      name="delete"
      onClick={(e) => {
        e.stopPropagation();
        deleteLayoutAttr(
          formStoreVertex(),
          props.item,
          graph,
          setGraph,
          formStoreVertex()?.P.txnId,
          props.componentName,
          showSuccessToast,
          layoutStoreId,
        );
      }}
      size={props.size}
      title={`Delete ${props.componentName}`}
    />
  );
}
