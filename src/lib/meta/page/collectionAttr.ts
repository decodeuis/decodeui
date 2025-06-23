import { isServer } from "solid-js/web";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/pages/settings/constants";

export const collectionAttr = [
  {
    componentName: "SystemTextInput",
    key: "displayName",
    onchange: '{"new": ["key","id"], "edit": ["key","id"]}',
  },
  {
    componentName: "SystemTextInput",
    displayName: "ID",
    key: "key",
  },
  {
    css: PROPERTIES.Css.TextFieldCss,
    componentName: "SystemTextInput",
    type: "textarea",
    key: "definition",
  },
  {
    collection: "g:'DataType'",
    componentName: "Select",

    key: "dataType",
  },
  {
    collection: "->$0DataType->$0Comp",
    componentName: "Select",

    key: "Comp",
    // smaller version:
    // collection: "g:'Comp'",
  },
  {
    collection: "g:'Coll'",
    componentName: "Select",

    key: "coll",
  },
  {
    componentName: "SystemTextInput",
    css: [PROPERTIES.Css.CheckBoxCss],
    type: "checkbox",
    key: "required",
  },
  {
    componentName: "SystemTextInput",
    css: [PROPERTIES.Css.CheckBoxCss],
    type: "checkbox",
    key: "disabled",
  },
  {
    componentName: "MultiSelect",
    key: "hide",
  },
  {
    componentName: "MultiSelect",
    key: "disabled",
  },
  {
    attributes: [
      {
        collection: "<-$0->$0Comp->$0Prop",
        componentName: "Select",

        displayExpr: "::'P.key'",
        key: "key",
      },
      {
        componentName:
          "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'||->$0Name->$0DataType->$0Default::'P.key'",
        key: "value",
        meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Properties",
    key: "Prop",
  },
  /*{
    attributes: [
      {
        collection: "g:'Role'",
        componentName: "Select",

        key: "role",
      },
      {
        attributes: [
          {
            collection: "g:'Perm'",
            componentName: "MultiSelect",

            key: "perm",
          },
          {
            componentName: "SystemTextInput",
            key: "scope",
            attributes: [
              TextInput
            ],
          },
        ],
        componentName: "DynamicTable",
        key: "Perm",
      },
    ],
    componentName: "DynamicTable",
    displayName: "Permissions",
    key: "Role",
  },*/
  {
    componentName: "DynamicTable",
    key: "Attr",
    label: "Attr",

    tab: "expand",
    type: "Attr",
  },
] as FieldAttribute[];

if (isServer) {
  let childAttrs: FieldAttribute = collectionAttr[collectionAttr.length - 1];
  for (let i = 0; i < 50; i++) {
    const attributes = JSON.parse(JSON.stringify(collectionAttr));
    childAttrs.attributes = attributes;
    childAttrs = attributes[attributes.length - 1];
  }
}
