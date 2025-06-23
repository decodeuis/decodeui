import { Icon } from "@iconify-icon/solid";
import { Style } from "@solidjs/meta";
import { createUniqueId } from "~/lib/solid/createUniqueId";

import type { Id } from "~/lib/graph/type/id";

export function OpenComponentSettings(
  props: Readonly<{ css?: string; id: Id }>,
) {
  const id = createUniqueId();
  return (
    <>
      <Style>
        {`._id {
  ${props.css}
`.replaceAll("._id", `.${id}`)}
      </Style>
      <Icon
        class={id}
        height={21}
        icon={"ph:gear"}
        noobserver
        onClick={() => {
          const currentURL = window.location.href;
          const navigateUrl = `${currentURL
            .split("/")
            .slice(0, -2)
            .join("/")}/Comp/${props.id}`;
          window.open(navigateUrl, "_blank");
        }}
        width={21}
      />
    </>
  );
}
