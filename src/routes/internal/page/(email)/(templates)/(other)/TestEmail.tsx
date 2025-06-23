import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { testEmailForm } from "~/routes/internal/page/(email)/(templates)/(other)/testEmailSchema";

export default function TestEmail() {
  return <SchemaRenderer form={testEmailForm} />;
}
