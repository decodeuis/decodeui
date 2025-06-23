import type { Session } from "neo4j-driver";
import { redirect } from "@solidjs/router";
import { downloadFileById } from "~/routes/api/file/functions/downloadFileById";

/**
 * Retrieves and downloads the company square logo
 * @param dbSession - Neo4j database session
 * @returns Response object containing the logo file or an error message
 * @throws APIError if the logo is not found
 */
export async function downloadCompanySquareLogo(
  dbSession: Session,
): Promise<Response> {
  // Query to get the company logo file ID
  const result = await dbSession.run(`
    MATCH (g:GlobalSetting)-[:CompanySquareLogo]->(f:File)
    RETURN elementId(f) as fileId
  `);

  if (result.records.length === 0) {
    // throw new APIError("Company logo not found", 404);
    return redirect("/images/logo_square.svg");
  }

  const fileId = result.records[0].get("fileId");
  return await downloadFileById(fileId, dbSession);
}
