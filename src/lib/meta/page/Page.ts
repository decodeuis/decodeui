import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import { PROPERTIES } from "~/pages/settings/constants";

import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "../base/Comp";
import { pageAttr } from "./pageAttr";

export const wrapWithTitle = (
  title: string,
  required: boolean,
  children: FieldAttribute,
) => {
  return {
    as: "div",
    attributes: [
      {
        as: "span",
        attributes: required
          ? [
              {
                as: "span",
                css: `return \`._id {
  color: \${args.theme.var.color.error};
}\`;`,
                componentName: "Html",
                text: " *",
              },
            ]
          : [],
        css: `return \`._id {
  flex: 0.5;
}\`;`,
        componentName: "Html",
        // key: `${title}`,
        text: title,
      },
      children,
    ],
    css: `return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}\`;`,
    componentName: "Html",
    title,
  };
};

// Dont add function, as it will break the server functions
export const Page: IFormMetaData = {
  attributes: [
    {
      as: "div",
      attributes: [
        {
          collection: "g:'File'",
          componentName: "Select",
          hide: true,
          key: "Preview",
          label: "File",
          labelKey: "::'P.fileName'",
          title: "Preview",
          // type: "Preview",
        },
        wrapWithTitle("Title", false, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            `return \`._id {
                flex: 1;
              }\`;`,
          ],
          componentName: "SystemTextInput",
          key: "title",
          // onchange: '{"new": ["key","id"]}', // TODO: Fix this, it's not working with kobalte
        }),
        wrapWithTitle("Key", true, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            `return \`._id {
                flex: 1;
              }\`;`,
          ],
          componentName: "SystemTextInput",
          key: "key",
          name: "Key",
          validation: { required: true },

          validationRules: [
            {
              message: "ID is required",
              type: "required",
            },
            {
              ignoreEmptyValue: true,
              message: "This ID is already taken",
              type: "custom",
              // validationCallback: (options: any) => {
              //   const { formData } =
              //     (options.validator.context as FormContext) ||
              //     ({} as FormContext);
              //   const [graph, _setGraph] = useGraph();
              //   const val = options.value;
              //   return !findVertexByLabelAndUniqueIdWithSkip(
              //     "Page",
              //     "id",
              //     val,
              //     formData.id,
              //     graph,
              //   );
              // },
            },
          ],
        }),
        wrapWithTitle("URL", true, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            `return \`._id {
                flex: 1;
              }\`;`,
          ],
          componentName: "SystemTextInput",
          key: "url",
          validation: { required: true },
          validationRules: [
            {
              message: "URL is required",
              type: "required",
            },
          ],
        }),
        wrapWithTitle("Description", false, {
          css: [
            PROPERTIES.Css.TextFieldCss,
            `return \`._id {
                flex: 1;
              }\`;`,
          ],
          componentName: "SystemTextInput",
          type: "textarea",
          key: "description",
        }),
        // {
        //   collection: "g:'Dashboard'",
        //   componentName: "MultiSelect",
        //   inward: true,
        //   key: "dashboard",
        //   parentLabel: "Dashboard",
        // },
        // wrapWithTitle("Public", false, {
        //   componentName: "SystemTextInput",
        //   css: [PROPERTIES.Css.CheckBoxCss],
        //   type: "checkbox",
        //   hideInGrid: true,
        //   key: "public",
        // }),
        /*{         componentName: "SystemTextInput",
        css: [PROPERTIES.Css.CheckBoxCss],
        type: "checkbox", key: "isRealTime" },
        {
          collection: "g:'Page'",
          componentName: "Select",
          displayName: "Collection",
          
            key: "coll",
            // inward: true,
            parentLabel: "Page",
          
        },
        {
          collection: `g:'{{->$0Coll::'P.key'}}'`,
          componentName: "Select",
            key: "data",
        },*/
        {
          attributes: pageAttr,
          componentName: "DynamicTable",
          hide: true,
          key: "Attr",
          label: "Attr",
          tab: "Attribute",
          type: "Attr",
        },
        {
          ...parentComponentAttribute,
          hide: true,
          hideInGrid: true,
          inward: true,
        },
        {
          ...parentTemplateAttribute,
          hide: true,
          hideInGrid: true,
          inward: true,
        },
        {
          collection: "->$0Perm",
          componentName: "MultiSelect",
          hide: true,
          hideInGrid: true,
          key: "globalPerm",
        },
        {
          collection: "->ChatHistory",
          componentName: "MultiSelect",
          hide: true,
          hideInGrid: true,
          key: "ChatHistory",
          label: "ChatHistory",
          type: "ChatHistory",
        },
      ],
      css: `return \`._id {
  display: flex;
  flex-direction: column;
  gap: 8px;
}\`;`,
      componentName: "Html",
    },
  ],
  key: "Page",
  title: "Page",
};

export const variantAttributes = {
  attributes: [
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      displayName: "Variant Name",
      key: "key",
    },
    {
      componentName: "Select",
      displayName: "Type",
      key: "type",

      options: `boolean
string
number
date`,
      // date
    },
    {
      as: "div",
      attributes: [
        {
          displayName: "Default Value",
          key: "defValue",
          // componentName: "SystemTextInput",
          // componentName: "::'P.type'",
          css: PROPERTIES.Css.TextFieldCss,
          props: `return {
              componentName: "SystemTextInput",
              type: args.data?.P.type === "number" ? "number" : 
                   args.data?.P.type === "boolean" ? "checkbox" :
                   args.data?.P.type === "date" ? "date" : "text",
            };`,
        },
        {
          as: "button",
          attributes: [
            {
              componentName: "Html",
              as: "icon",
              icon: "ph:x",
              size: 16,
            },
          ],
          css: `return \`._id {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: \${args.theme.var.color.error};
  background-color: transparent;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  &:hover {
    background-color: \${args.theme.var.color.error_light_100};
    color: \${args.theme.var.color.error};
  }
}\`;`,
          componentName: "Html",
          key: "button",
          props: `return {
              hide: () => {
                return (
                  args.data?.P.defValue === undefined ||
                  args.data?.P.defValue === null
                );
              },
              onClick: () => {
                args.mergeVertexProperties(
                  args.txnId,
                  args.data?.id,
                  args.graph,
                  args.setGraph,
                  {
                    defValue: null,
                  },
                );
              },
              title: "Clear default value",
            };`,
          type: "button",
        },
      ],
      css: `return \`._id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}\`;`,
      componentName: "Html",
      displayName: "Default Value",
    },
    {
      attributes: [
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "SystemTextInput",
          displayName: "Property Name",
          key: "key",
        },
        {
          displayName: "Value",
          key: "value",
          css: PROPERTIES.Css.TextFieldCss,
          props: `const type = args.evalExpression("<-$0::'P.type'", {
              graph: args.graph,
              setGraph: args.setGraph,
              vertexes: [args.data],
            });
            return {
              componentName: "SystemTextInput",
              type: type === "number" ? "number" : 
                   type === "boolean" ? "checkbox" :
                   type === "date" ? "date" : "text",
              valueFormat: type === "date" ? "iso" : undefined,
            };`,
        },
      ],
      componentName: "DynamicTable",
      displayName: "Variants",
      key: "option",
    },
  ],
  componentName: "DynamicTable",
  key: "Variant",
  hide: true,
  // label: "Variant",
  // type: "Variant",
} as FieldAttribute;
