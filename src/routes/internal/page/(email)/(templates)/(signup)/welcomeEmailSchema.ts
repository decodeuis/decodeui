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
    text: "Welcome to Our Platform!",
  },
  {
    as: "p",
    css: `return \`._id {
      margin-bottom: 16px;
    }\`;`,
    componentName: "Html",
    displayOrder: 2,
    text: "We're excited to have you on board. Here are some things you can do to get started:",
  },
  {
    as: "ul",
    attributes: [
      {
        as: "li",
        componentName: "Html",
        displayOrder: 1,
        text: "Complete your profile",
      },
      {
        as: "li",
        componentName: "Html",
        displayOrder: 2,
        text: "Explore our features",
      },
    ],
    css: `return \`._id {
      margin-bottom: 24px;
    }\`;`,
    componentName: "Html",
    displayOrder: 3,
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
      href: "${typeof window !== "undefined" ? window.location.origin : ""}/admin/"
    }`,
    target: "_blank",
    text: "Get Started",
  },
];

export const welcomeEmailForm = {
  attributes: [createEmailTemplate(content)],
  description:
    "Sent to welcome new users after they have successfully completed the signup process",
  key: "WelcomeEmail",
  title: "Welcome Email",
};
