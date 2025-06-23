/**
 * Email options required for sending an email
 */
export type EmailOptions = {
  from: string;
  html?: string;
  subject: string;
  text?: string;
  to: string | string[];
};

/**
 * Supported email providers
 */
export type EmailProvider =
  | "mailgun"
  | "plunk"
  | "postmark"
  | "resend"
  | "sendgrid";
