import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { createAppState } from "~/createAppState";
import { getEmailTemplateSchema } from "~/cypher/mutate/email/saveEmailTemplates";
import { mutateData } from "~/cypher/mutate/mutate_data/mutateData";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

// used for saving email templates for future use
export default async function GET({ request }: APIEvent) {
  const query = getQuery();
  const templateName = query.templatename;
  if (!templateName) {
    throw new APIError("Template name is required", 400);
  }

  const { dbSession } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();
  try {
    const emailTemplateSchema = getEmailTemplateSchema(templateName as string);
    if (!emailTemplateSchema) {
      throw new APIError("Email template not found", 404);
    }

    const [graph, setGraph] = createAppState();

    const txnId = generateNewTxnId(graph, setGraph);
    const { error } = createMeta(
      emailTemplateSchema,
      txnId,
      graph,
      setGraph,
      "EmailTemplate",
    );
    if (error) {
      throw new APIError("Failed to create meta", 500);
    }

    const commitData = commitTxn(txnId, graph);
    if (!commitData) {
      throw new APIError("Failed to upload Email Template", 500);
    }

    const res = await mutateData(commitData, tx);
    await tx.commit();
    return res;
  } catch (error) {
    await tx.rollback();
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
