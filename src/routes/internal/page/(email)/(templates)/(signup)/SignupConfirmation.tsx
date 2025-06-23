import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { signupConfirmationForm } from "~/routes/internal/page/(email)/(templates)/(signup)/signupConfirmationSchema";

export default function SignupConfirmation() {
  return <SchemaRenderer form={signupConfirmationForm} />;
}
