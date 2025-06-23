import { findUserByEmailOrUuid } from "~/cypher/mutate/user/findUserByEmailOrUuid";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function getUserRPC() {
  "use server";
  const { dbSession, subDomain } = await getDBSessionForSubdomain();
  try {
    const user = await getUserFromSession();
    // if (!user?.P?.email) {
    //   throw new APIError("Not Authorized", 401);
    // }

    const data = await findUserByEmailOrUuid(
      dbSession,
      user?.P?.email,
      user?.P?.uuid,
    );

    if (data.user) {
      data.user.P.subDomain = subDomain;
      delete data.user.P.password;
    }

    return data;
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
