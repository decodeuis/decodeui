import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { passwordChangedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/passwordChangedSchema";

export default function PasswordChanged() {
  return <SchemaRenderer form={passwordChangedForm} />;
}
