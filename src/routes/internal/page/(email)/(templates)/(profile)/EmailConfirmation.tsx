import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { emailConfirmationForm } from "./emailConfirmationSchema";

export default function EmailConfirmation() {
  return <SchemaRenderer form={emailConfirmationForm} />;
}
