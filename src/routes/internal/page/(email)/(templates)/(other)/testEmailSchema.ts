import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Test Email",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "This is a test email to verify that your email configuration is working correctly.",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.primary};
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    text: "If you received this email, your email settings are configured properly.",
  },
];

export const testEmailForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Used to verify that the email configuration is working correctly",
  key: "TestEmail",
  title: "Test Email",
};
