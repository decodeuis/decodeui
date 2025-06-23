export interface EmailSettings {
  active?: string; // 'smtp', 'sendgrid', etc. Empty means not configured
  fromEmail?: string;
  secure?: boolean;
  // SendGrid settings (can be extended)
  sendGridApiKey?: string;
  // SMTP settings
  smtpHost?: string;
  smtpPassword?: string;
  smtpPort?: number;
  smtpUsername?: string;

  [key: string]: unknown;
  // Add other provider settings as needed
}
