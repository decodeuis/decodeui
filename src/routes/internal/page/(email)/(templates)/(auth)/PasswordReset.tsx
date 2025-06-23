import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { passwordResetForm } from "./passwordResetSchema";

export default function PasswordReset() {
  return <SchemaRenderer form={passwordResetForm} />;
}
