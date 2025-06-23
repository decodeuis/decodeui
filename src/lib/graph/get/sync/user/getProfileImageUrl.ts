import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { profileImage } from "~/pages/settings/constants";

import { getProfileImageVertex } from "../store/getMemberVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getProfileImageUrl(graph: GraphInterface): string {
  const profileImageVertex = getProfileImageVertex(graph);
  return getDownloadLink(profileImageVertex) || profileImage;
}
