import { IconButton } from "~/components/styled/IconButton";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { createOpenInNewTab } from "~/features/page_designer/form_elements/common/ItemStyles";

import type { CssType } from "~/components/form/type/CssType";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

interface OpenInNewTabButtonProps {
  css?: CssType;
  item: Vertex;
  size: number;
}

export function OpenInNewTabButton(props: Readonly<OpenInNewTabButtonProps>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const getComponentName = () => parentRenderContext()?.context.componentName;
  const getCopmVertex = () =>
    getComponentName()
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          getComponentName()!,
        )
      : undefined;
  const handleOpenInNewTab = createOpenInNewTab(
    layoutStoreId,
    getCopmVertex(),
    graph,
    setGraph,
  );

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
      icon="ph:arrow-square-out"
      onClick={handleOpenInNewTab}
      size={props.size}
      title="Open in new tab"
    />
  );
}
