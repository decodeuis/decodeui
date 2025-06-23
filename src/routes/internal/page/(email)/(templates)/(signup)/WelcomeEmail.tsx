import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { welcomeEmailForm } from "~/routes/internal/page/(email)/(templates)/(signup)/welcomeEmailSchema";

export default function WelcomeEmail() {
  return <SchemaRenderer form={welcomeEmailForm} />;
}
