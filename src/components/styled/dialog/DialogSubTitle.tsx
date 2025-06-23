import type { ParentProps } from "solid-js";
import { As } from "~/components/As";

export function DialogSubTitle(props: ParentProps) {
  return (
    <As
      as="div"
      css={`return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 0.875rem;
  max-width: 36rem;
  margin-top: 0.5rem;
}\`;`}
    >
      <As as="p">{props.children}</As>
    </As>
  );
}
