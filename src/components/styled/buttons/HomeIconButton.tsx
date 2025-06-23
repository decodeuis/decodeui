import { useNavigate } from "@solidjs/router";

import { IconButton } from "~/components/styled/IconButton";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { getHomeUrl } from "~/lib/urls/getHomeUrl";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const HomeIconButton = () => {
  const [graph] = useGraph();
  const navigate = useNavigate();
  const isAdminSubDomain = () => getMemberVertex(graph).P.subDomain === "admin";

  const context = () => {
    if (isAdminSubDomain()) {
      return "system";
    }
    if (isAdminRole(graph)) {
      return "admin";
    }
    return "default";
  };

  return (
    <IconButton
      css={[
        headerIconButtonCss,
        `return \`._id {
  margin-left: 2px;
}\`;`,
      ]}
      icon="ph:house"
      onClick={() => navigate(getHomeUrl(context()))}
      size={22}
      title="Home"
      tooltipGroup="left-buttons"
    />
  );
};
