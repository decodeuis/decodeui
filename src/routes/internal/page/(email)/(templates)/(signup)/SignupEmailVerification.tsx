import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { signupEmailVerificationForm } from "./signupEmailVerificationSchema";

export default function SignupEmailVerification() {
  return <SchemaRenderer form={signupEmailVerificationForm} />;
}
