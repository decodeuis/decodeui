import { ofetch as $fetch } from "ofetch";

import type { EmailOptions } from "../types/email-options";
import type { EmailService } from "../types/email-service";

/**
 * Email service implementation for Postmark
 */
export class PostmarkService implements EmailService {
  private apiToken: string;
  private apiUrl: string;

  constructor(apiToken?: string, apiUrl = "https://api.postmarkapp.com/email") {
    this.apiToken = apiToken || process.env.POSTMARK_SERVER_TOKEN || "";
    this.apiUrl = apiUrl;
  }

  async send(emailOptions: EmailOptions): Promise<void> {
    if (!this.apiToken) {
      throw new Error("Postmark server token is missing");
    }

    const { from, html, subject, text, to } = emailOptions;
    if (!(to && from && (text || html))) {
      throw new Error("Required email fields are missing");
    }

    const payload = {
      From: from,
      HtmlBody: html,
      MessageStream: "outbound",
      Subject: subject,
      TextBody: text,
      To: Array.isArray(to) ? to.join(",") : to,
    };

    try {
      const response = await $fetch(this.apiUrl, {
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": this.apiToken,
        },
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Failed to send email with Postmark:", error);
      throw new Error("Email sending failed with Postmark");
    }
  }
}
