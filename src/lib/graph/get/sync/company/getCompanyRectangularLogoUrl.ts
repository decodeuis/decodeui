import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { rectangleLogoImage } from "~/pages/settings/constants";

import { getCompanyRectangularLogoVertex } from "./getCompanyRectangularLogoVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function getCompanyRectangularLogoUrl(graph: GraphInterface): string {
  const companyLogoVertex = getCompanyRectangularLogoVertex(graph);
  return getDownloadLink(companyLogoVertex) || rectangleLogoImage;
}
