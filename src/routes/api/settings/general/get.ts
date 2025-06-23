import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const result = await dbSession.run(
      `MATCH (s:GlobalSetting)
       OPTIONAL MATCH (s)-[:CompanyRectangularLogo]->(companyRectangularLogo:File)
       OPTIONAL MATCH (s)-[:CompanySquareLogo]->(companySquareLogo:File)
       RETURN s as settings, companyRectangularLogo, companySquareLogo`,
    );

    const node = result.records[0]?.get("settings");
    const companyRectangularLogoNode = result.records[0]?.get(
      "companyRectangularLogo",
    );
    const companySquareLogoNode = result.records[0]?.get("companySquareLogo");
    const settings = node ? convertNodeToJson(node) : null;
    const companyRectangularLogo = companyRectangularLogoNode
      ? convertNodeToJson(companyRectangularLogoNode)
      : null;
    const companySquareLogo = companySquareLogoNode
      ? convertNodeToJson(companySquareLogoNode)
      : null;

    return { companyRectangularLogo, companySquareLogo, settings };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
