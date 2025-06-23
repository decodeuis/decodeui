import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { PageDesignerWrapper } from "~/features/page_designer/layout/PageDesignerWrapper";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function FormEdit() {
  const params = useParams();

  return (
    <Switch>
      <Match
        when={["Component", ...PageDesignerLabels].includes(params.entity)}
      >
        <PageDesignerWrapper />
      </Match>
      <Match when={true}>
        <PageViewWrapper dataId={params.id} pageVertexName={params.entity} />
      </Match>
    </Switch>
  );
}
