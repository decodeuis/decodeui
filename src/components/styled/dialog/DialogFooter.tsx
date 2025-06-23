import { type JSX, Show, splitProps } from "solid-js";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import type { CssType } from "~/components/form/type/CssType";

// TODO: Depricate this component
export function DialogFooter(
  props: JSX.IntrinsicElements["button"] & {
    buttonText?: string;
    children?: any;
    containerCss?: string;
    disabled?: boolean;
    css?: CssType;
  },
) {
  const [local, buttonProps] = splitProps(props, [
    "children",
    "buttonText",
    "containerCss",
  ]);

  return (
    <As
      as="div"
      css={[
        ...ensureArray(local.containerCss),
        `return \`._id {
  display: flex;
  align-items: center;
  gap: 0.50rem;
  margin-bottom: 6px;
}\`;`,
      ]}
    >
      <Show when={local.children}>{local.children}</Show>
      <Show when={!local.children}>
        <As as="button" {...buttonProps} type="button">
          {local.buttonText || "Save"}
        </As>
      </Show>
    </As>
  );
}
