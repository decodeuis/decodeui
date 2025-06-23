import { ofetch as $fetch } from "ofetch";

import type { EmailOptions } from "../types/email-options";
import type { EmailService } from "../types/email-service";

/**
 * Email service implementation for SendGrid
 */
export class SendGridService implements EmailService {
  private apiKey: string;
  private apiUrl: string;

  constructor(
    apiKey?: string,
    apiUrl = "https://api.sendgrid.com/v3/mail/send",
  ) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || "";
    this.apiUrl = apiUrl;
  }

  async send(emailOptions: EmailOptions): Promise<void> {
    if (!this.apiKey) {
      throw new Error("SendGrid API key is missing");
    }

    const { from, html, subject, text, to } = emailOptions;
    if (!(to && from && (text || html))) {
      throw new Error("Required email fields are missing");
    }

    const payload = {
      content: [
        {
          type: text ? "text/plain" : "text/html",
          value: text || html,
        },
      ],
      from: {
        email: from,
      },
      personalizations: [
        {
          subject,
          to: Array.isArray(to)
            ? to.map((email) => ({ email }))
            : [{ email: to }],
        },
      ],
    };

    try {
      const response = await $fetch(this.apiUrl, {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Failed to send email with SendGrid:", error);
      throw new Error("Email sending failed with SendGrid");
    }
  }
}
