import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { createStore } from "solid-js/store";

import { popoverWrapperSchema } from "./popoverWrapperSchema";

// Define type for popover state store
type PopoverStateStore = ReturnType<
  typeof createStore<{
    isVisible: boolean;
  }>
>;

// Define a type for function arguments with popoverState in contextData
interface PopoverFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    popoverState: PopoverStateStore;
    [key: string]: unknown;
  };
}

/**
 * Example of how to use the popoverWrapperSchema function
 */
export const popoverWrapperSchemaExample = () => {
  // Create a button that will trigger the popover
  const actionButton = {
    as: "button",
    css: `return \`._id {
  padding: 8px 16px;
  background-color: \${args.theme.var.color.primary};
  color: white;
  border-radius: 4px;
  cursor: pointer;
}\`;`,
    componentName: "Button",
    text: "Hover Me",
  };

  // Create the content that will appear in the popover
  const popoverContent = {
    as: "div",
    attributes: [
      {
        as: "h3",
        css: `return \`._id {
  font-size: 18px;
  color: \${args.theme.var.color.primary};
  margin: 0px;
  margin-bottom: 8px;
}\`;`,
        componentName: "Html",
        text: "Popover Title",
      },
      {
        as: "p",
        css: `return \`._id {
  font-size: 14px;
  color: \${args.theme.var.color.text};
  margin: 0px;
}\`;`,
        componentName: "Html",
        text: "This is the popover content. You can hover over the button to see this content.",
      },
    ],
    css: `return \`._id {
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  max-width: 300px;
}\`;`,
    componentName: "Html",
  };

  // Wrap the button with the popover
  return popoverWrapperSchema(actionButton, popoverContent);
};

/**
 * Example of how to use popoverWrapperSchema with dynamic content
 */
export const dynamicPopoverExample = () => {
  // Create a button that will trigger the popover
  const actionButton = {
    as: "button",
    css: `return \`._id {
  padding: 8px 16px;
  background-color: \${args.theme.var.color.primary};
  color: white;
  border-radius: 4px;
  cursor: pointer;
}\`;`,
    componentName: "Button",
    text: "Dynamic Popover",
  };

  // Create dynamic content that will appear in the popover
  const dynamicPopoverContent = {
    as: "div",
    attributes: [
      {
        as: "h3",
        css: `return \`._id {
  font-size: 18px;
  color: \${args.theme.var.color.primary};
  margin: 0px;
  margin-bottom: 8px;
}\`;`,
        componentName: "Html",
        text: "Dynamic Content",
      },
      {
        as: "p",
        css: `return \`._id {
  font-size: 14px;
  color: \${args.theme.var.color.text};
  margin: 0px;
}\`;`,
        componentName: "Html",
        props: (options: PopoverFunctionArgumentType) => ({
          text: `This popover uses data from context: ${options.contextData.popoverState[0]?.isVisible ? "Visible" : "Hidden"}`,
        }),
      },
    ],
    css: `return \`._id {
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  max-width: 300px;
}\`;`,
    componentName: "Html",
  };

  // Wrap the button with the popover
  return popoverWrapperSchema(actionButton, dynamicPopoverContent);
};
