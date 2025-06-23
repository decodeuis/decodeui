import { Icon } from "@iconify-icon/solid";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { iconMap } from "~/lib/ui/iconMap";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { ComponentName } from "../components/ComponentName";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const HoverAttrConfigPopOver = (props: Readonly<{ item: Vertex }>) => {
  const [graph] = useGraph();
  const getComponentName = () => getComponentLabel(graph, props.item);
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
  color: \${args.theme.var.color.text_light_100};
  padding: 0.25rem;
  position: absolute;
  border-radius: 5px 5px 0 0;
  right: 0;
}\`;`}
      >
        <As
          as={Icon}
          css={[ICON_BUTTON_STYLES.baseCss]}
          icon={iconMap[getComponentName() as keyof typeof iconMap]}
          noobserver
        />
        <ComponentName componentName={getComponentName()!} />
      </As>
    </As>
  );
};
