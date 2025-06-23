import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { verificationCodeForm } from "~/routes/internal/page/(email)/(templates)/(auth)/verificationCodeSchema";

export default function VerificationCode() {
  return <SchemaRenderer form={verificationCodeForm} />;
}
