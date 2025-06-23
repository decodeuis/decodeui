import { useParams, useSearchParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export default function EmailTemplate() {
  const [_searchParams] = useSearchParams();
  const params = useParams();
  return (
    <PageViewWrapper
      dontConfirmExit={true}
      hideSaveCancelButton={true}
      isNoPermissionCheck={true}
      pageKeyName={params.template as string}
      pageVertexName={"EmailTemplate"}
    />
  );
}
