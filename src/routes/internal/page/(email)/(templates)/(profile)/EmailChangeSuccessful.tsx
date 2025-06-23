import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailChangeSuccessfulForm } from "./emailChangeSuccessfulSchema";

export default function EmailChangeSuccessful() {
  return <SchemaRenderer form={emailChangeSuccessfulForm} />;
}
