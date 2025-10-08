import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { Perm } from "./auth/Perm";
import { Role } from "./auth/Role";
import { User } from "./auth/User";
import { Comp } from "./base/Comp";
import { GlobalSetting } from "./base/GlobalSetting";
import { File, FileTag, Folder } from "./file/File";
import { Coll } from "./page/Coll";
import { Page, variantAttributes } from "./page/Page";
import { Function } from "./page/Function";
import { PROPERTIES } from "~/pages/settings/constants";

const FormMetaDataAuth: { [key: string]: IFormMetaData } = {
  Perm: Perm,
  Role: Role,
  User: User,
  // TODO: Dynamic Filter on Grid: Role->Filter
};

export const FormMetaData: { [key: string]: IFormMetaData } = {
  ...FormMetaDataAuth,
  // TODO: Coll has only one Attr. Add validation for that.
  // Coll: Coll("Page"),
  // CollCategory: CollCategory,
  Comp: Comp,
  // CompCategory: CompCategory,
  // DataType: DataType,
  File: File,
  FileTag: FileTag,
  Folder: Folder,
  Function: Function,
  GlobalSetting: GlobalSetting,
  Page: Page,
};
for (const key in FormMetaData) {
  // @ts-expect-error ignore
  FormMetaData[key].isNoPermissionCheck = true;
  // @ts-expect-error ignore
  FormMetaData[key].addActionButtons = true;
}
FormMetaData.Page.attributes.push({
  ...Coll("Page").attributes.find((x) => x.key === "PermGlobal")!,
});

FormMetaData.Page.attributes.push({
  attributes: [
    {
      // componentName: "MultiSelect", // MultiSelect also supported
      componentName: "SystemTextInput",
      css: PROPERTIES.Css.TextFieldCss,
      key: "key",
    },
  ],
  componentName: "DynamicTable",
  hide: true,
  key: "Unique",
});

export const ComponentLabel = "Component";
FormMetaData.Component = {
  attributes: [
    ...FormMetaData.Page.attributes.map((attr) => {
      // If this attribute has nested attributes, filter out the URL field
      if (attr.attributes && Array.isArray(attr.attributes)) {
        return {
          ...attr,
          attributes: attr.attributes.filter(
            (nestedAttr) => nestedAttr.title !== "URL",
          ),
        };
      }
      return attr;
    }),
    variantAttributes!,
  ],
  key: "Component",
  title: "Component",
};

FormMetaData.CompExample = {
  attributes: [
    ...FormMetaData.Page.attributes,
    // TODO: Fix this. It will select Parent Comp.
    {
      collection: "g:'Comp'",
      componentName: "Select",
      displayName: "Parent Component",
      key: "Comp",
      // validation: { required: true },
    },
  ],
  key: "CompExample",
  title: "Comp Example",
};

// FormMetaData.ThankYouPage = {
//   attributes: [...FormMetaData.Page.attributes],
//   key: "ThankYouPage",
//   title: "Thank You Page",
// };
// FormMetaData.ErrorPage = {
//   attributes: [...FormMetaData.Page.attributes],
//   key: "ErrorPage",
//   title: "Error Page",
// };
FormMetaData.Template = {
  attributes: [...FormMetaData.Page.attributes],
  key: "Template",
  title: "Templates",
};
FormMetaData.EmailTemplate = {
  attributes: [...FormMetaData.Page.attributes],
  key: "EmailTemplate",
  title: "Email Template",
};
