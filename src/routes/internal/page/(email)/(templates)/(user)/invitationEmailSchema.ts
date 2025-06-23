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
    text: "You've Been Invited",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "You've been invited to join our platform. Please click the button below to complete your registration and set up your account.",
  },
  {
    as: "a",
    css: `return \`._id {
      background-color: \${args.theme.var.color.primary};
      border: none;
      border-radius: 4px;
      color: \${args.theme.var.color.primary_text};
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
    text: "Accept Invitation",
  },
  {
    as: "p",
    css: `return \`._id {
      color: \${args.theme.var.color.text};
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 4,
    text: "This invitation link will expire in 7 days. If you have any questions, please contact the administrator who invited you.",
  },
];

export const invitationEmailForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent to invite new users to join the platform, containing a registration link valid for 7 days",
  key: "InvitationEmail",
  title: "User Invitation",
};
