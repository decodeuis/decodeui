import { SchemaRenderer } from "~/pages/SchemaRenderer";

export function LoadingSpinner() {
  return (
    <SchemaRenderer
      form={{
        attributes: [
          {
            as: "div",
            componentName: "Html",
            css: `return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}\`;`,
            attributes: [
              {
                as: "div",
                componentName: "Html",
                css: [
                  `return \`@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}\`;`,
                  `return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: \${args.theme.var.color.background_light_200};
  position: relative;
}\`;`,
                ],
                attributes: [
                  {
                    as: "icon",
                    componentName: "Html",
                    icon: "ph:spinner",
                    width: 32,
                    height: 32,
                    css: `return \`._id {
  animation: spin 1s linear infinite;
  color: \${args.theme.var.color.primary};
}\`;`,
                  },
                ],
              },
            ],
          },
        ],
        key: "LoadingSpinner",
      }}
    />
  );
}
