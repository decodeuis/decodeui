import { SchemaRenderer } from "~/pages/SchemaRenderer";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

interface NotFoundProps {
  error: string;
}

export function NotFound(props: NotFoundProps) {
  const notFoundSchema: FieldAttribute = {
    componentName: "Html",
    as: "div",
    css: (args: FunctionArgumentType) => `return \`._id {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: ${args.theme.var.color.background};
      color: ${args.theme.var.color.text};
      padding: 2rem;
    }\`;`,
    attributes: [
      {
        componentName: "Html",
        as: "h1",
        css: (args: FunctionArgumentType) => `return \`._id {
          font-size: 6rem;
          font-weight: bold;
          color: ${args.theme.var.color.primary};
          margin: 0;
          line-height: 1;
        }\`;`,
        text: "404",
      },
      {
        componentName: "Html",
        as: "h2",
        css: (args: FunctionArgumentType) => `return \`._id {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: ${args.theme.var.color.text};
        }\`;`,
        text: "Page Not Found",
      },
      {
        componentName: "Html",
        as: "p",
        css: (args: FunctionArgumentType) => `return \`._id {
          font-size: 1.125rem;
          color: ${args.theme.var.color.text_light_200};
          text-align: center;
          max-width: 600px;
          margin-top: 0.5rem;
        }\`;`,
        text:
          props.error || "The requested page could not be found on the server.",
      },
      {
        componentName: "Html",
        as: "a",
        href: "/",
        css: (args: FunctionArgumentType) => `return \`._id {
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          background-color: ${args.theme.var.color.primary};
          color: ${args.theme.var.color.primary_text};
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
          
          &:hover {
            background-color: ${args.theme.var.color.primary_dark_200};
          }
        }\`;`,
        text: "Go to Home",
      },
    ],
  };

  return (
    <SchemaRenderer
      form={{
        key: "404-page",
        title: "404 Not Found",
        attributes: [notFoundSchema],
      }}
    />
  );
}
