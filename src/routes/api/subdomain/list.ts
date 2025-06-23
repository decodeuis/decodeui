import type { APIEvent } from "@solidjs/start/server";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getSubDomains } from "~/routes/api/subdomain/getSubDomains";

export async function POST({ request }: APIEvent) {
  try {
    return await getSubDomains(request);
  } catch (error) {
    return handleAPIError(error);
  }
}
