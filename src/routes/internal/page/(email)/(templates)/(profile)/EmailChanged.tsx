import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailChangedForm } from "./emailChangedSchema";

export default function EmailChanged() {
  return <SchemaRenderer form={emailChangedForm} />;
}
