import type { ParentProps } from "solid-js";
import { As } from "~/components/As";

export function TabsContainer(props: ParentProps) {
  return (
    <As
      as="div"
      css={[
        `return \`._id {
  line-height: 1rem;
  border-bottom-width: 1px;
  border-color: \${args.theme.var.color.border};
  color: \${args.theme.var.color.text_light_300};
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: center;
}\`;`,
      ]}
    >
      {props.children}
    </As>
  );
}
