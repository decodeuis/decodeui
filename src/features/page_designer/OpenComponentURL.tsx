import { Icon } from "@iconify-icon/solid";
import { createMemo, Match, Switch } from "solid-js";

import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function OpenComponentURL(
  props: Readonly<{ css?: string; meta: Vertex }>,
) {
  const [graph] = useGraph();
  const componentKey = () => props.meta.P.key.split(".")[0];
  const _componentVertex = () =>
    findVertexByLabelAndUniqueId(graph, "Comp", "key", componentKey());

  const componentUrl = createMemo(() => {
    return null;
  });

  return (
    <Switch>
      <Match when={componentUrl() !== null}>
        <As
          as="a"
          css={props.css}
          href={componentUrl()!}
          rel="noreferrer"
          target="_blank"
        >
          <Icon height={21} icon={"ci:external-link"} noobserver width={21} />
        </As>
      </Match>
    </Switch>
  );
}
