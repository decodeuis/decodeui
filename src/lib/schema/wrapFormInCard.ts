import type { FieldAttribute } from "../meta/FormMetadataType";

export const wrapFormInCard = (formSchema: FieldAttribute) => {
  return {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "form",
            attributes: [formSchema],
            componentName: "Html",
            props: () => ({
              onSubmit: (e: Event) => {
                e.preventDefault();
              },
            }),
          },
        ],
        css: `return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  padding: 16px;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 1px 2px 3px \${args.theme.var.color.primary};
  max-width: 450px;
}\`;`, // max-width:700px width:90%
        componentName: "Html",
      },
    ],
    css: `return \`._id {
  min-height: 100vh;
  background-color: \${args.theme.var.color.background_light_200};
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}\`;`,
    componentName: "Html",
  } as FieldAttribute;
};
