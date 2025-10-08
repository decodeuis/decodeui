import type { Session } from "neo4j-driver";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import {executeNamedServerFunction} from "~/cypher/get/executeNamedServerFunction";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { convertNodeToJson, neo4jConvert } from "../conversion/convertNodeToJson";

interface ServerFunctionRequest {
  functionBody: string;
  contextData?: any;
}

export async function executeServerFunction(
  request: ServerFunctionRequest,
  context: EvalExpressionContext & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
): Promise<ServerResult> {
  "use server";

  let dbSession: Session;
  let sessionCreatedLocally = false;

  if (context.dbSession) {
    dbSession = context.dbSession;
  } else {
    ({ dbSession } = await getDBSessionForSubdomain());
    sessionCreatedLocally = true;
    context.dbSession = dbSession;
  }

  try {
    // Create the function from the provided body
    // The function has access to args object with session, context, and contextData
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    const serverFunction = new AsyncFunction("args", request.functionBody);

    // Prepare the args object that will be available in the function
    const args = {
      session: dbSession,
      context: context,
      contextData: request.contextData || {},
      vertexes: context.vertexes || [],
      executeNamedServerFunction,
      getUserFromSession,
      convertNodeToJson,
      neo4jConvert,
      graph: {
        nodes: context.nodes,
        relationships: context.relationships,
      },
    };

    // Execute the function
    const result = await serverFunction(args);

    return {
      result,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
    };
  } catch (error: any) {
    console.error("Error in executeServerFunction:", error, error.cause);
    return { error: error.message };
  } finally {
    // Clean up: close the session if created locally and remove from context
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close();
      delete context.dbSession;
    }
  }
}
