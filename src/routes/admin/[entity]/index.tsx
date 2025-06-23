import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import FileManager from "~/features/file_manager/FileManager";
import { DataGrid } from "~/features/grid/DataGrid";

export default function TablePage() {
  const params = useParams();
  return (
    <>
      <Switch>
        <Match when={params.entity === "Comp"}>
          <FileManager
            parentVertexLabel="Comp"
            rootKeys={{ $or: [{ key: "Root" }] }}
            toParentEdgeType="ParentComp"
          />
        </Match>
        <Match when={true}>
          <DataGrid isShowPagination tableId={params.entity} />
        </Match>
      </Switch>
    </>
  );
}
