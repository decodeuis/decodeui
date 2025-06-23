import { createEmailTemplate } from "~/routes/internal/page/(email)/baseEmailTemplate";

const content = [
  {
    as: "h1",
    css: `return \`._id {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16;
    }\`;`,
    componentName: "Html",
    displayOrder: 1,
    text: "Account Deletion Request",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "We've received a request to delete your account. Your account will be scheduled for deletion and will be permanently removed after 48 hours from now.",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
    text: "During this 48-hour period, you will no longer be able to log in to your account. If you change your mind, please contact our support team immediately to cancel the deletion process.",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "Please note that once your account is deleted, all your data will be permanently removed and cannot be recovered.",
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
      margin-top: 16px;
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

export const accountDeletionRequestForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent when a user requests to delete their account, explaining the 48-hour deletion process and providing support contact information",
  key: "AccountDeletionRequest",
  title: "Account Deletion Request",
};
