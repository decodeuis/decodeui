import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

export const pageAttr = [
  {
    collection: "g:'ALL_LABELS'",
    componentName: "Select",
    displayName: "Collection",
    key: "collection",
    saveValue: true,
  },
  {
    // collection: "->$0Coll->Attr||-$0->$0Coll->Attr",
    componentName: "Select",
    // displayExpr: "P.displayName||P.key",
    displayExpr: "$P.displayName ($P.key)",
    displayName: "Data",
    key: "data",
  },
  {
    componentName: "SystemTextInput",
    displayName: "ID",
    key: "key",
  },
  // to load initial data
  {
    componentName: "MultiSelect",
    key: "All",
    type: "'*'",
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
    displayName: "Property",
    key: "Prop",
  },
  {
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
            componentName: "Select",

            key: "perm",
          },
        ],
        componentName: "DynamicTable",
        key: "Perm",
      },
    ],
    componentName: "DynamicTable",
    key: "Role",
  },
  {
    attributes: [
      {
        collection: "g:'Role'",
        componentName: "Select",
        key: "role",
        parentLabel: "Role",
      },
      {
        componentName: "Select",
        displayName: "Access Level",
        ignoreFetch: true,
        key: "access",
        options: `NONE
VIEW
CREATE
EDIT
FULL`,
      },
      // {
      //   componentName: "SystemTextInput",
      //   key: "scope",
      // },
    ],
    componentName: "DynamicTable",
    key: "Perm",
  },
  {
    componentName: "DynamicTable",
    key: "Attr",
    label: "Attr",

    tab: "expand",
    type: "Attr",
  },
] as FieldAttribute[];

let pageChildAttrs: FieldAttribute = pageAttr[pageAttr.length - 1];
// Keep max level 10, else the Page navigation is very slow. because revert transaction on record takes so much time.
for (let i = 0; i < 10; i++) {
  const attributes = JSON.parse(JSON.stringify(pageAttr));
  pageChildAttrs.attributes = attributes;
  pageChildAttrs = attributes[attributes.length - 1];
}
