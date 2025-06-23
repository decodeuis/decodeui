import type { CssType } from "~/components/form/type/CssType";

export interface FieldAttribute {
  // postSubmit?: (formValues: IFormGroup, formGroup: IFormGroup, tableItemFormGroup: IFormGroup, values: FormResult)=>void
  attributes?: FieldAttribute[];
  css?: CssType | CssType[];
  componentName: string;
  displayName?: string;
  key?: string;
  meta?: string;
  validationRules?: Array<{}>;

  [key: string]: any;
}

export interface IFormMetaData {
  attributes: FieldAttribute[];
  isInlineEditable?: boolean;
  isRealTime?: boolean;
  key?: string; // required to create new vertex
  title?: string;
}
