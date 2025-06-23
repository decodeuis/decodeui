import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { PROPERTIES } from "~/pages/settings/constants";

export const parentCompAttribute = {
  collection: "g:'Comp'",
  componentName: "Select",
  displayName: "Parent Component",
  key: "ParentComp",
  type: "ParentComp",
  // validation: { required: true },
};
export const parentComponentAttribute = {
  collection: "g:'Component'",
  componentName: "MultiSelect",
  displayName: "Parent Component",
  key: "ParentComponent",
  type: "ParentComponent",
  // validation: { required: true },
};
export const parentTemplateAttribute = {
  collection: "g:'Template'",
  componentName: "MultiSelect",
  displayName: "Parent Template",
  key: "ParentTemplate",
  type: "ParentTemplate",
  // validation: { required: true },
};
export const parentPermAttribute = {
  collection: "g:'Perm'",
  componentName: "MultiSelect",
  displayName: "Parent Permission",
  key: "ParentPerm",
  type: "ParentPerm",
  // validation: { required: true },
};

export const Comp: IFormMetaData = {
  attributes: [
    {
      collection: "g:'CompCategory'",
      componentName: "Select",

      inward: true,
      key: "category",
      parentLabel: "CompCategory",
    },
    {
      componentName: "SystemTextInput",
      key: "key",
    },
    {
      componentName: "SystemTextInput",
      key: "label",
    },
    {
      childLabel: "Child",
      collection: "g:'Comp'",
      componentName: "Select",

      displayName: "Parent Component",
      inward: true,
      key: "parent",
      parentLabel: "Comp",
    },
    {
      collection: "g:'DataType'",
      componentName: "MultiSelect",
      displayName: "DataType",

      inward: true,
      key: "dataType",
      parentLabel: "DataType",
    },
    {
      componentName: "SystemTextInput",
      css: [PROPERTIES.Css.CheckBoxCss],
      type: "checkbox",
      displayName: "Children",
      key: "child",
    },
    // {
    //   componentName: "SystemTextInput",
    //   css: [PROPERTIES.Css.CheckBoxCss],
    //   type: "checkbox",
    //   displayName: "Hidden",
    //   key: "hide",
    // },
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      type: "textarea",
      key: "description",
    },
    parentCompAttribute,
    // TODO: add validation, duplicate row with same key is not allowed.
    {
      attributes: [
        {
          componentName: "SystemTextInput",
          key: "key",
        },
        {
          componentName: "SystemTextInput",
          key: "type",
        },
        {
          componentName: "SystemTextInput",
          key: "default",
        },
        // {
        //   collection: "g:'DataType'",
        //   componentName: "Select",
        //   key: "dataType",
        //   onchange: '["Comp",null]',
        // },
        // {
        //   collection: "->$0DataType->$0Comp",
        //   componentName: "Select",
        //   displayName: "Component",
        //   key: "Comp",
        // },
        // {
        //   collection: "g:'CompExample'",
        //   componentName: "Select",
        //   displayName: "Comp Example",
        //   key: "CompExample",
        // },
        // {
        //   attributes: [
        //     {
        //       collection: "<-$0->$0Comp->$0Prop",
        //       componentName: "Select",
        //       displayExpr: "::'P.key'",
        //       key: "key",
        //     },
        //     {
        //       componentName:
        //         "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'",
        //       meta: "->$0Name->$0Comp<-CompChild->$0Prop++->$0Name->$0Comp->$0Prop",
        //       key: "value",
        //     },
        //   ],
        //   componentName: "DynamicTable",
        //   displayName: "Value Property",
        //   // TODO: Be sure the key is ok, it will not change in production.
        //   key: "valueProp",
        //   tab: "Properties",
        // },
        // {
        //   componentName:
        //     "->$0Comp<-CompChild::'P.key'||->$0Comp::'P.key'||->$0DataType->$0Default::'P.key'",
        //   meta: "(->$0Comp<-CompChild->$0Prop)++(->$0Comp->$0Prop)++(->$0ValueProp)",
        //   key: "value",
        //   // componentName: "->$0Comp<-CompChild::'P.key'||->$0Comp::'P.key'||->$0DataType->$0Default::'P.key'||defaultComp|->$0DataType::'P.key'",
        // },
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "SystemTextInput",
          type: "textarea",
          key: "description",
          // autoResizeEnabled: true,
          width: "550px",
        },
        // {
        //   children: "Reset",
        //   class: "border-color:#FF0000 color:#FF0000",

        // componentName: "Html",
        // as: "button",
        // type: "button",
        //   key: "reset",
        //   variant: "outlined",
        //   // TODO:
        //   // function: "reset",
        //   // onchange: '{"new": ["value","clear"], "edit": ["value","clear"]}',
        // },
      ],
      componentName: "DynamicTable",
      key: "Prop",
      tab: "Properties",
    },
    {
      attributes: [
        {
          componentName: "SystemTextInput",
          key: "key",
        },
        {
          componentName: "SystemTextInput",
          key: "label",
        },
        {
          css: PROPERTIES.Css.TextFieldCss,
          componentName: "SystemTextInput",
          type: "textarea",
          key: "description",

          // autoResizeEnabled: true,
          width: "550px",
        },
      ],
      componentName: "DynamicTable",
      key: "Event",
      tab: "Events",
    },
  ],
  isInlineEditable: false,
  key: "Comp",
  title: "Component",
};
