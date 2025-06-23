import { IconButton } from "~/components/styled/IconButton";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { handleDragStart } from "~/features/page_designer/event_handler/handleDragStart";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { DeleteButton } from "../buttons/DeleteButton";
import { ImportHtmlButton } from "../buttons/ImportHtmlButton";
import { ParentButton } from "../buttons/ParentButton";
import { PreviewCSSButton } from "../buttons/PreviewCSSButton";
import { SaveAsTemplateButton } from "../buttons/SaveAsTemplateButton";
import { CopyButton } from "../buttons/CopyButton";
import { PasteButton } from "../buttons/PasteButton";
import { OpenInNewTabButton } from "../buttons/OpenInNewTabButton";
import { ComponentName } from "../components/ComponentName";
import { InsertButtons } from "../menus/InsertButtons";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

interface SelectedAttrConfigPopOverProps {
  item: Vertex;
}

export function SelectedAttrConfigPopOver(
  props: Readonly<SelectedAttrConfigPopOverProps>,
) {
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const [graph, setGraph] = useGraph();
  const getComponentName = () => parentRenderContext()?.context.componentName;

  const iconSize = 20;
  return (
    <As
      as="span"
      css={[
        `return \`._id {
  position: relative;
}\`;`,
      ]}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  background-color: \${args.theme.var.color.primary};
  bottom: 100%;
  color: \${args.theme.var.color.primary_text};
  gap: 5px;
  padding: 0.25rem;
  position: absolute;
  border-radius: 5px;
  button {
    color: \${args.theme.var.color.primary_text};
  }
}\`;`}
      >
        <IconButton
          css={[
            ICON_BUTTON_STYLES.baseCss,
            ICON_BUTTON_STYLES.defaultCss,
            `return \`._id {
            background-color: transparent;
            border: none;
          }\`;`,
          ]}
          draggable={true}
          icon="ph:dots-six-vertical-bold"
          onClick={() => {}}
          onDragStart={(e) =>
            handleDragStart(e, graph, setGraph, layoutStoreVertex(), props.item)
          }
          size={iconSize}
          title="Move"
        />
        <InsertButtons item={props.item} size={iconSize} />
        <ComponentName componentName={getComponentName()!} />
        <OpenInNewTabButton item={props.item} size={iconSize} />
        <ParentButton item={props.item} size={iconSize} />
        <CopyButton item={props.item} size={iconSize} />
        <PasteButton item={props.item} size={iconSize} />
        <SaveAsTemplateButton item={props.item} size={iconSize} />
        <PreviewCSSButton item={props.item} size={iconSize} />
        <ImportHtmlButton item={props.item} size={iconSize} />
        <DeleteButton
          componentName={getComponentName()!}
          item={props.item}
          size={iconSize}
        />
      </As>
    </As>
  );
}
