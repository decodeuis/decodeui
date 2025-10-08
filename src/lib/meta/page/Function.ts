import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

export const Function: IFormMetaData = {
  isInlineEditable: true,
  hideSaveCancelButton: false,
  attributes: [
    // Key field
    {
      componentName: "Html",
      as: "div",
      attributes: [
        {
          componentName: "Html",
          as: "label",
          text: "Function Key",
          css: `return \`._id {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: \${args.theme.var.color.text};
}\`;`,
        } as FieldAttribute,
        {
          componentName: "Html",
          as: "input",
          key: "key",
          props: `return {
  type: "text",
  placeholder: "Enter function key",
  value: args.data?.P?.key || "",
  onChange: (e) => args.onChange(e.target.value)
};`,
          css: `return \`._id {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    outline: none;
    border-color: \${args.theme.var.color.primary};
    box-shadow: 0 0 0 2px \${args.theme.var.color.primary_light_100};
  }
}\`;`,
        } as FieldAttribute,
      ],
    } as FieldAttribute,
    // Description field
    {
      componentName: "Html",
      as: "div",
      css: `return \`._id {
  margin-top: 1.5rem;
}\`;`,
      attributes: [
        {
          componentName: "Html",
          as: "label",
          text: "Description",
          css: `return \`._id {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: \${args.theme.var.color.text};
}\`;`,
        } as FieldAttribute,
        {
          componentName: "Html",
          as: "textarea",
          key: "description",
          props: `return {
  placeholder: "Enter function description",
  value: args.data?.P?.description || "",
  onChange: (e) => args.onChange(e.target.value)
};`,
          css: `return \`._id {
  width: 100%;
  padding: 0.75rem;
  min-height: 80px;
  font-size: 1rem;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    outline: none;
    border-color: \${args.theme.var.color.primary};
    box-shadow: 0 0 0 2px \${args.theme.var.color.primary_light_100};
  }
}\`;`,
        } as FieldAttribute,
      ],
    } as FieldAttribute,
    // Body field
    {
      componentName: "Html",
      as: "div",
      css: `return \`._id {
  margin-top: 1.5rem;
}\`;`,
      attributes: [
        {
          componentName: "Html",
          as: "label",
          text: "Function Body",
          css: `return \`._id {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: \${args.theme.var.color.text};
}\`;`,
        } as FieldAttribute,
        {
          componentName: "Html",
          as: "textarea",
          key: "body",
          props: `return {
  placeholder: "// Enter your function body here...",
  value: args.data?.P?.body || "",
  onChange: (e) => args.onChange(e.target.value)
};`,
          css: `return \`._id {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: \${args.theme.var.color.background};
  color: \${args.theme.var.color.text};
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 0.375rem;
  resize: vertical;
  tab-size: 2;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    outline: none;
    border-color: \${args.theme.var.color.primary};
    box-shadow: 0 0 0 2px \${args.theme.var.color.primary_light_100};
  }
}\`;`,
        } as FieldAttribute,
      ],
    } as FieldAttribute,
    // Help text
    {
      componentName: "Html",
      as: "div",
      css: `return \`._id {
  margin-top: 1.5rem;
  padding: 1rem;
  background: \${args.theme.var.color.background_light_200};
  color: \${args.theme.var.color.background_light_200_text};
  border-radius: 0.375rem;
  font-size: 0.875rem;
}\`;`,
      attributes: [
        {
          componentName: "Html",
          as: "strong",
          text: "Available in function body:",
          css: `return \`._id {
  color: \${args.theme.var.color.text};
  display: block;
  margin-bottom: 0.5rem;
}\`;`,
        } as FieldAttribute,
        {
          componentName: "Html",
          as: "ul",
          css: `return \`._id {
  margin: 0;
  padding-left: 1.5rem;
  line-height: 1.6;
}\`;`,
          attributes: [
            {
              componentName: "Html",
              as: "li",
              text: "args.params - Request parameters sent from the client",
            } as FieldAttribute,
            {
              componentName: "Html",
              as: "li",
              text: "args.session - Current user session",
            } as FieldAttribute,
            {
              componentName: "Html",
              as: "li",
              text: "args.graph - Graph interface for database operations",
            } as FieldAttribute,
            {
              componentName: "Html",
              as: "li",
              text: "args.user - Current authenticated user (if available)",
            } as FieldAttribute,
          ],
        } as FieldAttribute,
      ],
    } as FieldAttribute,
  ],
  key: "Function",
  title: "Function",
};