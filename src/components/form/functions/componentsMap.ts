import { Transition, TransitionGroup } from "solid-transition-group";
import { SlotField } from "~/components/fields/component/SlotField";
import { ComponentField } from "~/components/fields/component/ComponentField";
import { SelectField } from "~/components/fields/select/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { ZIndex } from "~/components/fields/ZIndex";
import { FormField } from "../../fields/FormField";
import { HtmlField } from "../../fields/HtmlField";
import { FileUploader } from "../../styled/FileUploader";

export const componentsMap: Record<string, any> = {
  // Button: ButtonField,
  Component: ComponentField,
  Slot: SlotField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  FileUploader: FileUploader,
  Form: FormField,
  Html: HtmlField,
  MultiSelect: SelectField,
  // Page: PageField,
  Select: SelectField,
  Table: TableInputField,
  // Title: MetaTitle,
  Transition,
  TransitionGroup,
  ZIndex,
};
