import { writeFileSync } from "fs";
import { join } from "path";
import Hjson from "hjson";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { normalizeMultilineStrings } from "~/lib/hjson/normalizeMultilineStrings";
import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { normalizeSchema } from "./normalizeSchema";

export async function writeSchemaToFile(
  basePath: string,
  subdomain: string,
  type: "components" | "pages",
  key: string,
  schema: ExportedSchema,
): Promise<void> {
  const dirPath = join(basePath, subdomain, type);
  await ensureDirectoryExists(dirPath);

  const normalizedSchema = normalizeSchema(schema);
  let hjsonContent = Hjson.stringify(normalizedSchema, {
    space: 2,
    bracesSameLine: true,
    multiline: "std",
    colors: false,
  });

  // Normalize multiline string indentation
  hjsonContent = normalizeMultilineStrings(hjsonContent);

  const filePath = join(dirPath, `${key}.hjson`);
  writeFileSync(filePath, hjsonContent, "utf8");
}
