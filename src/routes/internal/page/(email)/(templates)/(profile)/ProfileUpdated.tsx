import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { profileUpdatedForm } from "~/routes/internal/page/(email)/(templates)/(profile)/profileUpdatedSchema";

export default function ProfileUpdated() {
  return <SchemaRenderer form={profileUpdatedForm} />;
}
