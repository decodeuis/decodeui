import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/pages/settings/constants";

import { binopsInitial, unaryOperatorsInitial } from "../../expression_eval";
// import { FormMetaData } from "../formMetaData";
import { collectionAttr } from "./collectionAttr";

export const Coll: (key: string) => IFormMetaData = (key) => {
  return {
    attributes: [
      {
        componentName: "SystemTextInput",
        key: "title",
        // onchange: '{"new": ["key","id"]}', // TODO: fix now its giving error Error: Failed to execute 'addEventListener' on 'EventTarget': parameter 2 is not of type 'Object'.
      },
      {
        componentName: "SystemTextInput",
        key: "key",
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
            //     (options.validator.context as IFormContext) ||
            //     ({} as IFormContext);
            //   const [graph, _setGraph] = useGraph();
            //   const val = options.value;
            //   if (Object.keys(FormMetaData).includes(val)) {
            //     return false;
            //   }
            //   return !findVertexByLabelAndUniqueIdWithSkip(
            //     "Page",
            //     "id",
            //     val,
            //     formData.id,
            //     graph,
            //   );
            // },
          },
          // , {
          //   type: 'email',
          //   message: 'Email is invalid',
          // }
        ],
      },
      {
        collection: "g:'CollCategory'",
        componentName: "Select",

        inward: true,
        key: "category",
        parentLabel: "CollCategory",
      },
      {
        collection: "g:'Dashboard'",
        componentName: "MultiSelect",

        inward: true,
        key: "dashboard",
        parentLabel: "Dashboard",
      },
      {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        type: "textarea",
        key: "description",
      },
      // {         componentName: "SystemTextInput",
      // css: [PROPERTIES.Css.CheckBoxCss],
      // type: "checkbox", key: "public" },
      {
        componentName: "SystemTextInput",
        css: [PROPERTIES.Css.CheckBoxCss],
        type: "checkbox",
        key: "isInlineEditable",
      },
      // { key: "supportCustomFields",         componentName: "SystemTextInput",
      //   css: [PROPERTIES.Css.CheckBoxCss],
      //   type: "checkbox", },
      // { key: "searchOnly",         componentName: "SystemTextInput",
      //   css: [PROPERTIES.Css.CheckBoxCss],
      //   type: "checkbox", },
      // { key: "supportDeletedRecordSearch",         componentName: "SystemTextInput",
      //   css: [PROPERTIES.Css.CheckBoxCss],
      //   type: "checkbox", },
      {
        collection: "->Attr",
        componentName: "MultiSelect",
        displayName: "Primary Key",

        key: "pk",
        // TODO: add validation
        // If there is not key attribute,
        // then this field is required.
      },
      {
        collection: "->Attr",
        componentName: "MultiSelect",

        key: "nameKey",
        // TODO: add validation
        // If there is not key attribute,
        // then this field is required.
      },

      {
        attributes: collectionAttr,
        componentName: "DynamicTable",
        key: "Attr",

        label: "Attr",
        tab: "Attribute",

        type: "Attr",
      },
      {
        attributes: [
          {
            componentName: "SystemTextInput",
            key: "key",
          },
          // {
          //   componentName: "SystemTextInput",
          //   key: "label",
          // },
          {
            attributes: [
              {
                componentName: "Select",
                displayName: "Paren",
                key: "leftParen",

                options: `(
((
(((`,
              },
              {
                componentName: "Select",
                displayName: "Field",
                key: "leftField",
                // collection: "g:'DataType'",
              },
              // {
              //   componentName: "SystemTextInput",
              //   displayName: "Value",
              //   key: "leftValue",
              // },
              {
                componentName: "Select",
                displayName: "Operator",
                key: "operator",
                options: `${Object.keys(unaryOperatorsInitial).join("\n")}
${Object.keys(binopsInitial).join("\n")}`,
              },
              {
                componentName: "Select",
                displayName: "Field",
                key: "rightField",
                // collection: "g:'DataType'",
              },
              /*{
                componentName: "SystemTextInput",
                displayName: "Value",
                key: "rightValue",
              },
              {
                collection: "g:'DataType'",
                componentName: "Select",
                displayName: "DataType",
                
                  key: "dataType",
                
              },
              {
                collection: "->$0DataType->$0Comp||Comp",
                componentName: "Select",
                displayName: "Component",
                
                  key: "comp",
                
              },*/
              {
                componentName: `->$0RightField->$0Comp<-CompChild::'P.key'||->$0RightField->$0Comp::'P.key'||->$0RightField->$0DataType->$0Default::'P.key'`,
                displayName: "Value",
                key: "rightValue",
                meta: "(->$0Comp<-CompChild->$0Prop)++(->$0Comp->$0Prop)++(->$0ValueProp)",
              },
              {
                componentName: "Select",
                displayName: "Paren",
                key: "rightParen",

                options: `)
))
)))`,
              },
              {
                componentName: "Select",
                displayName: "AndOr",
                key: "andOr",

                options: `${Object.keys(binopsInitial).join("\n")}`,
              },
            ],
            componentName: "DynamicTable",
            displayName: "Conditions",
            key: "cond",
          },
        ],
        componentName: "DynamicTable",
        key: "Rule",

        label: "Rule",
        tab: "Rules",

        type: "Rule",
      },

      /*      {
                    key: "Child",
                    componentName: "DynamicTable",
                    tab: "Child",
                    attributes: [
                      {
                        key: "coll",
                        componentName: "Select",
                        
   
                          collection: "g:'Coll'",
                        
                      },
                      {
                        key: "displayName",
                        componentName: "SystemTextInput",
                        
                          onchange: '{"new": ["key","id"], "edit": ["key","id"]}',
                        
                      },
                      {
                        key: "key",
                        componentName: "SystemTextInput",
                      },
                      {
                        key: "tab",
                        componentName: "Select",
                        
   
                          collection: "-CollChild->$0Tab",
                        
                      },
                      {
                        key: "group",
                        componentName: "Select",
                        
                          collection: "-CollChild->$0Group",
   
                        
                      },
                      {
                        key: "Prop",
                        displayName: "Property",
                        componentName: "DynamicTable",
                        attributes: [
                          {
                            key: "key",
                            componentName: "Select",
                            
                              displayExpr: "::'P.key'",
                              collection: "g:'Comp[Table]'->$0Prop",
                            
                          },
                          {
                            key: "value",
                            meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
                            componentName: "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'",
                          },
                        ],
                      },
                    ],
                  },*/
      {
        attributes: [
          {
            collection: "g:'Coll'",
            componentName: "Select",

            key: "coll",
          },
          {
            componentName: "SystemTextInput",
            key: "displayName",
          },
          {
            componentName: "SystemTextInput",
            key: "fieldDefaults",
          },
          {
            attributes: [
              {
                collection: "g:'Comp[Table]'->$0Prop",
                componentName: "Select",

                displayExpr: "::'P.key'",
                key: "key",
              },
              {
                componentName:
                  "->$0Name->$0Comp<-CompChild::'P.key'||->$0Name->$0Comp::'P.key'",
                key: "value",
                meta: "(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)",
              },
            ],
            componentName: "DynamicTable",
            displayName: "Property",
            key: "Prop",
          },
        ],
        componentName: "DynamicTable",
        key: "Transform",
        tab: "Transform",
      },
      {
        attributes: [
          // {
          //   componentName: "SystemTextInput",
          //   key: "key",
          //   validation: { required: true },
          // },
          {
            childLabel: key,
            collection: "g:'Role'",
            componentName: "Select",
            inward: true,
            key: "role",
            parentLabel: "Role",
          },
          // This will be hidden in the UI
          // {
          //   collection: "g:'Perm'",
          //   componentName: "MultiSelect",
          //   key: "perm",
          // },
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
          //   css: PROPERTIES.Css.TextFieldCss,
          //   componentName: "SystemTextInput",
          //   key: "scope",
          // },
        ],
        componentName: "DynamicTable",
        hide: true,
        inward: true,
        key: "PermGlobal",
        label: `Role${key}`, // row Label
        parentLabel: `Role${key}`, // Edge label: parentLabel+ vertex Label
      },
      {
        attributes: [
          {
            collection: "<-$0->Attr",
            componentName: "MultiSelect",
            displayName: "Unique Constrain Keys",

            key: "pk",
          },
        ],
        componentName: "DynamicTable",
        hide: true,
        key: "uniqueConstrain",
        tab: "Unique Constrain",
      },
    ],
    key: "Coll",
    title: "Collection",
  };
};
