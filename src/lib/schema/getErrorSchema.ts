import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function getErrorSchema(key: string, customCss?: string) {
  return {
    as: "span",
    css:
      customCss ||
      `return \`._id {color:red; grid-column:span 2; margin-top:-22px;}\`;`,
    componentName: "Html",
    key: key,
    props: (args: FunctionArgumentType) => ({
      hide: !args.error(),
      text: args.error(),
    }),
  };
}
