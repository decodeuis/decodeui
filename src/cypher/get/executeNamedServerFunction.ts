import type { Session } from "neo4j-driver";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { convertNodeToJson, neo4jConvert } from "../conversion/convertNodeToJson";

interface NamedServerFunctionRequest {
  functionName: string;
  contextData?: any;
}

export async function executeNamedServerFunction(
  request: NamedServerFunctionRequest,
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
    // Query to find the Function vertex with the given key
    const query = `
      MATCH (f:Function {key: $functionName})
      RETURN f
    `;

    const result = await dbSession.run(query, {
      functionName: request.functionName,
    });

    if (result.records.length === 0) {
      return { 
        error: `Function with name '${request.functionName}' not found` 
      };
    }

    const functionVertex = result.records[0].get('f');
    const functionBody = functionVertex.properties.body;

    if (!functionBody) {
      return {
        error: `Function '${request.functionName}' has no body defined`
      };
    }

    // Create the async function from the body stored in the database
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    const serverFunction = new AsyncFunction("args", functionBody);

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
      functionName: request.functionName,
    };

    // Execute the function
    const executionResult = await serverFunction(args);

    return {
      result: executionResult,
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
    };
  } catch (error: any) {
    console.error(`Error executing named function '${request.functionName}':`, error, error.cause);
    return { 
      error: `Failed to execute function '${request.functionName}': ${error.message}` 
    };
  } finally {
    // Clean up: close the session if created locally and remove from context
    if (sessionCreatedLocally && dbSession) {
      await dbSession.close();
      delete context.dbSession;
    }
  }
}