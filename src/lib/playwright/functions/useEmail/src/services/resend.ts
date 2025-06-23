import { ofetch as $fetch } from "ofetch";

import type { EmailOptions } from "../types/email-options";
import type { EmailService } from "../types/email-service";

/**
 * Email service implementation for Resend
 */
export class ResendService implements EmailService {
  private apiToken: string;
  private apiUrl: string;

  constructor(apiToken?: string, apiUrl = "https://api.resend.com/emails") {
    this.apiToken = apiToken || process.env.RESEND_API_TOKEN || "";
    this.apiUrl = apiUrl;
  }

  async send(emailOptions: EmailOptions): Promise<void> {
    if (!this.apiToken) {
      throw new Error("Resend API token is missing");
    }

    const { from, html, subject, text, to } = emailOptions;
    if (!(to && from && (text || html))) {
      throw new Error("Required email fields are missing");
    }

    const payload = {
      from,
      html: html || undefined,
      subject,
      text: text || undefined,
      to: Array.isArray(to) ? to : [to],
    };

    try {
      const response = await $fetch(this.apiUrl, {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Failed to send email with Resend:", error);
      throw new Error("Email sending failed with Resend");
    }
  }
}
