import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { invitationEmailForm } from "./invitationEmailSchema";

export default function InvitationEmail() {
  return <SchemaRenderer form={invitationEmailForm} />;
}
