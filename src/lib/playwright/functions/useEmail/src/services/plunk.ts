import { ofetch as $fetch } from "ofetch";

import type { EmailOptions } from "../types/email-options";
import type { EmailService } from "../types/email-service";

/**
 * Email service implementation for Plunk
 */
export class PlunkService implements EmailService {
  private apiToken: string;
  private apiUrl: string;

  constructor(apiToken?: string, apiUrl = "https://api.useplunk.com/v1/send") {
    this.apiToken = apiToken || process.env.PLUNK_API_TOKEN || "";
    this.apiUrl = apiUrl;
  }

  async send(emailOptions: EmailOptions): Promise<void> {
    if (!this.apiToken) {
      throw new Error("Plunk token is missing");
    }

    const { from, html, subject, text, to } = emailOptions;
    if (!(to && from && (text || html))) {
      throw new Error("Required email fields are missing");
    }

    const payload = {
      body: html || text,
      from,
      subject,
      to,
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
      console.error("Failed to send email with Plunk:", error);
      throw new Error("Email sending failed with Plunk");
    }
  }
}
