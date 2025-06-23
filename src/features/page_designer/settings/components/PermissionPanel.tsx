import { TablePanel } from "./TablePanel";
import type { Vertex } from "~/lib/graph/type/vertex";

interface PermissionPanelProps {
  title?: string;
  data?: Vertex;
  meta: Vertex;
  isNoPermissionCheck?: boolean;
  isRealTime?: boolean;
}

export function PermissionPanel(props: PermissionPanelProps) {
  return (
    <TablePanel
      title={props.title || "Permissions"}
      icon="ph:lock"
      data={props.data}
      meta={props.meta}
      addButtonAriaLabel="Add new permission"
      isNoPermissionCheck={props.isNoPermissionCheck ?? true}
      isRealTime={props.isRealTime ?? false}
    />
  );
}
