// CSS-in-JS type definitions
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export type CssStringType = string | string[];
export type CssFunctionType = (options: FunctionArgumentType) => CssStringType;
export type CssType =
  | CssStringType
  | CssFunctionType
  | Array<CssStringType | CssFunctionType>;
