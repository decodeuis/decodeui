import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Two-Factor Authentication Code",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Here is your two-factor authentication code:",
  },
  {
    as: "div",
    attributes: [
      {
        as: "p",
        css: `return \`._id {
          color: \${args.theme.var.color.primary};
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 8px;
          margin: 0;
          font-family: 'Courier New', monospace;
        }\`;`,
        componentName: "Html",
        displayOrder: 1,
        text: "847291",
      },
    ],
    css: `return \`._id {
      background-color: \${args.theme.var.color.background_light_100};
      border: 2px solid \${args.theme.var.color.primary};
      border-radius: 8px;
      margin: 24px 0;
      padding: 24px 16px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "This code will expire in 5 minutes. Do not share this code with anyone.",
  },
];

export const twoFactorAuthForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when two-factor authentication is required, containing a verification code",
  key: "TwoFactorAuth",
  title: "Two-Factor Authentication Code",
};
