import { Switch, Match, JSX } from "solid-js";
import {
  DataContext,
  useDataContext,
} from "~/features/page_attr_render/context/DataContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";

import { isVertex } from "~/lib/graph/mutate/core/vertex/isVertex";
import type { Vertex } from "~/lib/graph/type/vertex";

export function DataInternal(props: {
  data: any;
  index: number;
  meta: Vertex;
  contextName: string;
  repeaterValue: any;
  children?: JSX.Element;
  renderChildren?: boolean;
  isNoPermissionCheck?: boolean;
}) {
  const context = useDataContext() || {};
  const repeaterStore = new Proxy(context, {
    get(target, key) {
      if (key === props.contextName) {
        return props.repeaterValue;
      }
      if (key === `${props.contextName}Index`) {
        return props.index;
      }
      if (key === "index") {
        return props.index;
      }
      return target[key];
    },
  });
  return (
    <DataContext.Provider value={repeaterStore}>
      <Switch>
        <Match when={props.renderChildren}>
          {props.children}
        </Match>
        <Match when={true}>
          <PageAttrRender
            data={isVertex(props.repeaterValue) ? props.repeaterValue : props.data}
            metaVertex={props.meta}
            isNoPermissionCheck={props.isNoPermissionCheck}
          />
        </Match>
      </Switch>
    </DataContext.Provider>
  );
}
