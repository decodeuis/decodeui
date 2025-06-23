import { renderPageAsHtml } from "~/lib/playwright/renderPageAsHtml";
import { sendEmail } from "~/lib/playwright/sendEmail";

import { APIError } from "../api/server/apiErrorHandler";
import type { Vertex } from "~/lib/graph/type/vertex";

// New helper function for sending the email
export async function sendNotificationEmail(
  pageName: string,
  queryParams: Record<string, string>,
  subject: string,
  user: Vertex,
  subDomain: string,
  secureToken?: string,
) {
  const result = await renderPageAsHtml({
    pageName: pageName,
    queryParams: {
      loginTime: new Date().toISOString(),
      username: user.P.username,
      ...queryParams,
    },
    secureToken,
    subDomain: subDomain,
  });

  if (!(result.success && result.html)) {
    throw new APIError(result.error || "Failed to render page", 500);
  }

  if (result.success && result.html) {
    await sendEmail({
      content: result.html,
      subDomain: subDomain,
      subject: subject,
      to: user.P.email,
    });
  }
}
