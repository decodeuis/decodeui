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
    text: "Email Change Notification",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "We're writing to let you know that a request has been made to change the email address associated with your account.",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    text: "If you initiated this change, no further action is required. The new email address will be activated after verification.",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.error};
      font-weight: bold;
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "If you did not request this change, please contact our support team immediately.",
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
    displayOrder: 5,
    props: `return {
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/support/contact"
    }`,
    target: "_blank",
    text: "Contact Support",
  },
];

export const emailChangedForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent to notify users that a request has been made to change their email address, with instructions if they didn't initiate the change",
  key: "EmailChanged",
  title: "Email Change Notification",
};
