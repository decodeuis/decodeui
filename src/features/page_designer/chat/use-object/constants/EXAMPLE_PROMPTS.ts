export interface PromptGroup {
  title: string;
  prompts: string[];
}

export const EXAMPLE_PROMPTS: PromptGroup[] = [
  {
    title: "Page Generate",
    prompts: [
      "Create a landing page with hero section, features, and contact form",
      "Create a blog post layout with featured image",
      "Create a product detail page with gallery and specs",
      "Create a portfolio page with project grid",
      "Create a contact us page with form and map",
      "Create a pricing page with multiple tiers",
    ],
  },
  {
    title: "Component Generate",
    prompts: [
      "Create a responsive navigation bar component with logo and menu items",
      "Create a hero section component with image, heading and call-to-action button",
      "Create a contact form component with simple and detailed variants",
      "Create a pricing table component with monthly/yearly variants",
      "Create a footer component with minimal and detailed variants",
      "Create a testimonials component with grid and carousel variants",
      "Create a product gallery component with list and grid variants",
      "Create a FAQ accordion component with multiple styling variants",
      "Create a team members showcase component with grid and list variants",
      "Create a services showcase component with icon/image variants",
      "Create a portfolio grid component with multiple filtering variants",
    ],
  },
];
