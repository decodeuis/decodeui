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
    text: "Reset Your Password",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "We received a request to reset your password. Please use the following verification code to complete the process:",
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
        props: `return {
            text: args.searchParams.otp,
          }`,
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
    text: "This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.",
  },
];

export const passwordResetForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when users request a password reset, containing a verification code valid for 10 minutes",
  key: "PasswordReset",
  title: "Reset Your Password",
};
