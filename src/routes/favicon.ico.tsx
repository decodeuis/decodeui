import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { downloadCompanySquareLogo } from "~/routes/api/file/downloadCompanySquareLogoFn";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { APIEvent } from "@solidjs/start/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    return await downloadCompanySquareLogo(dbSession);
  } catch (error) {
    try {
      // Serve the default logo
      const defaultLogoPath = path.resolve("public/images/logo_square.svg");
      const logoContent = await fs.readFile(defaultLogoPath);

      return new Response(logoContent, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
        },
      });
    } catch {
      // If the default logo also can't be read, fall back to the original error handler
      return handleAPIError(error);
    }
  } finally {
    await dbSession.close();
  }
}
