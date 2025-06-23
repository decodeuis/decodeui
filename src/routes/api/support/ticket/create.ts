import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { email, message, name, subject } = await request.json();

  try {
    const query = `
      CREATE (t:Support {
        name: $name,
        email: $email,
        subject: $subject,
        message: $message,
        createdAt: datetime()
      })
      WITH t
      OPTIONAL MATCH (status:SupportStatus {key: 'Open'})
      FOREACH(s IN CASE WHEN status IS NOT NULL THEN [status] ELSE [] END | 
        CREATE (t)-[:SupportSupportStatus]->(s)
      )
      RETURN t
    `;

    const result = await dbSession.run(query, {
      email,
      message,
      name,
      subject,
    });

    const ticket = convertNodeToJson(result.records[0].get("t"));

    return {
      graph: {
        edges: {},
        vertexes: {
          [ticket.id]: ticket,
        },
      },
      result: ticket,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
