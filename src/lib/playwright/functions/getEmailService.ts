import type { EmailProvider } from "./useEmail/src/types/email-options";
import type { EmailService } from "./useEmail/src/types/email-service";

import { MailgunService } from "./useEmail/src/services/mailgun";
import { PlunkService } from "./useEmail/src/services/plunk";
import { PostmarkService } from "./useEmail/src/services/postmark";
import { ResendService } from "./useEmail/src/services/resend";
import { SendGridService } from "./useEmail/src/services/sendgrid";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Factory function to get the email service based on the provider
 * @param provider - The email provider
 * @returns The email service instance
 * @throws Error if the provider is not supported
 */
// https://github.com/SupersaasHQ/useEmail
export function useEmail(vertex: Vertex): EmailService {
  switch (vertex.P.active as EmailProvider) {
    case "mailgun": {
      return MailgunService(vertex.P.mailgunApiKey);
    }
    case "plunk": {
      return new PlunkService(vertex.P.plunkApiKey);
    }
    case "postmark": {
      return new PostmarkService(vertex.P.postmarkApiKey);
    }
    case "resend": {
      return new ResendService(vertex.P.resendApiKey);
    }
    case "sendgrid": {
      return new SendGridService(vertex.P.sendGridApiKey);
    }
    default: {
      throw new Error(`Unsupported email provider: ${vertex.P.active}`);
    }
  }
}
