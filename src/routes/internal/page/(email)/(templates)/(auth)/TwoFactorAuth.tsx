import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { twoFactorAuthForm } from "~/routes/internal/page/(email)/(templates)/(auth)/twoFactorAuthSchema";

export default function TwoFactorAuth() {
  return <SchemaRenderer form={twoFactorAuthForm} />;
}
