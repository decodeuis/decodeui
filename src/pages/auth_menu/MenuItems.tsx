import { type JSX, Show } from "solid-js";

import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";

import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface MenuItemsProps {
  onClose: () => void;
}

export function MenuItems(props: Readonly<MenuItemsProps>): JSX.Element {
  const [graph] = useGraph();
  const isAuthenticated = () => {
    const member = getMemberVertex(graph);
    return !!member?.P?.email;
  };

  return (
    <Show
      fallback={<UnauthenticatedMenu onClose={props.onClose} />}
      when={isAuthenticated()}
    >
      <AuthenticatedMenu onClose={props.onClose} />
    </Show>
  );
}
