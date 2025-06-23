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
    text: "Email Change Successful",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Your email address has been successfully updated. This is now your primary email for account notifications and communications.",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    text: "If you need to make any additional changes to your account, please visit your account settings.",
  },
  {
    as: "a",
    css: `return \`._id {
      background-color: \${args.theme.var.color.primary};
      border: none;
      border-radius: 4px;
      color: \${args.theme.var.color.text_light_900};
      cursor: pointer;
      display: inline-block;
      padding: 8px 16px;
      text-decoration: none;
      &:hover {
        opacity: 0.9;
      }
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    props: `return {
      // href: window.location.origin + "/admin/UserSettings",
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/"
    }`,
    target: "_blank",
    text: "Go to Account Settings",
  },
];

export const emailChangeSuccessfulForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Confirmation email sent after an email address change has been successfully completed",
  key: "EmailChangeSuccessful",
  title: "Email Change Successful",
};
