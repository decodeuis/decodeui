import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

/**
 * Type for the dynamic props returned by props functions
 */
export type DynamicPropsType = Record<string, unknown> & {
  beforeMount?: (arg: FunctionArgumentType) => void;
  onMount?: () => undefined | (() => void);
  onUnmount?: (arg: FunctionArgumentType) => void;
  readOnly?: boolean;
  componentName?: string;
  hide?: boolean | ((arg: FunctionArgumentType) => boolean);
  show?: boolean | ((arg: FunctionArgumentType) => boolean);
  text?: string;
};
