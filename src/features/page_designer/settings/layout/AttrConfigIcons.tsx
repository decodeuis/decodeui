import { createSelector, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { DeleteButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/DeleteButton";
import { ImportHtmlButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/ImportHtmlButton";
import { ParentButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/ParentButton";
import { SaveAsTemplateButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/SaveAsTemplateButton";
import { CopyButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/CopyButton";
import { PasteButton } from "~/features/page_attr_render/page_attr_dnd_wrapper/buttons/PasteButton";
import { InsertButtons } from "~/features/page_attr_render/page_attr_dnd_wrapper/menus/InsertButtons";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { getComponentLabel } from "../../functions/component/getComponentLabel";
import { HideShowIcon } from "./HideShowIcon";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function AttrConfigIcons(
  props: Readonly<{ metaVertex: Vertex; parentRef: HTMLElement }>,
) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );

  const isRootLevel = () =>
    formStoreVertex()?.P.formDataId === props.metaVertex.id;

  // const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);

  const iconSize = 32;

  const getComponent = () => getComponentLabel(graph, props.metaVertex);

  return (
    <DropdownMenu
      applyDefaultStyles={false}
      offset={-32}
      parentRef={props.parentRef}
      placement="right"
      useFlip={false}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: \${args.theme.var.color.background_light_100};
}\`;`}
      >
        <Show when={isSelectedLayoutId(props.metaVertex.id)}>
          <InsertButtons item={props.metaVertex} size={iconSize} />
        </Show>

        <Show when={isSelectedLayoutId(props.metaVertex.id)}>
          <Show when={!isRootLevel()}>
            <ParentButton item={props.metaVertex} size={iconSize} />
          </Show>

          <CopyButton item={props.metaVertex} size={iconSize} />

          <PasteButton item={props.metaVertex} size={iconSize} />

          {/* <Show when={!isRootLevel()}> */}
          <SaveAsTemplateButton item={props.metaVertex} size={iconSize} />
          {/* </Show> */}

          <ImportHtmlButton item={props.metaVertex} size={iconSize} />

          <Show when={!isRootLevel()}>
            <HideShowIcon iconSize={iconSize} metaVertex={props.metaVertex} />
          </Show>

          <Show when={!isRootLevel()}>
            <DeleteButton
              componentName={getComponent()!}
              item={props.metaVertex}
              size={iconSize}
            />
          </Show>
        </Show>
      </As>
    </DropdownMenu>
  );
}
