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
    text: "Confirm Your New Email Address",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "Please confirm your new email address by clicking the button below:",
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
      margin-bottom: 16px;
      padding: 8px 16px;
      text-decoration: none;
      &:hover {
        opacity: 0.9;
      }
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    props: `return {
      href: args.searchParams.url,
    }`,
    target: "_blank",
    text: "Confirm Email Change",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "This link will expire in 24 hours. If you did not request this change, please ignore this email or contact support if you have concerns.",
  },
];

export const emailConfirmationForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when users request to change their email address, containing a verification link to confirm the new email",
  key: "EmailConfirmation",
  title: "Confirm Your New Email Address",
};
