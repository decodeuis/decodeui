import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { accountDeletionRequestForm } from "~/routes/internal/page/(email)/(templates)/(account)/accountDeletionSchema";

export default function AccountDeletionRequest() {
  return <SchemaRenderer form={accountDeletionRequestForm} />;
}
