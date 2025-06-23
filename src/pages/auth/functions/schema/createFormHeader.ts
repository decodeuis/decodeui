import { getLogoSchema } from "~/routes/internal/page/(email)/baseEmailTemplate";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

/**
 * Creates a form header with logo and title
 * @param title - Form title
 * @param subheader - Optional subheader text
 * @returns Form header schema
 */
export function createFormHeader(title: string, subheader?: string) {
  return [
    getLogoSchema(
      `return \`._id {display:grid; place-items:center;}\`;`,
      `return \`._id {height:80px;}\`;`,
      `return \`._id {color: \${args.theme.var.color.text_dark_600};}\`;`,
    ),
    {
      as: "h1",
      css: SETTINGS_CONSTANTS.TITLE_CSS,
      componentName: "Html",
      displayOrder: 2,
      text: title,
    },
    ...(subheader
      ? [
          {
            as: "p",
            css: `return \`._id {
        color: \${args.theme.var.color.text_light_400};
        text-align: center;
        margin-top: 8px;
        font-size: 16px;
      }\`;`,
            componentName: "Html",
            displayOrder: 3,
            text: subheader,
          },
        ]
      : []),
  ];
}
