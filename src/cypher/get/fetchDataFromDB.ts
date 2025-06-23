import type { Session } from "neo4j-driver";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { evalExpressionAsync } from "~/lib/expression_eval";

import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import type { NestedExpression } from "../types/NestedExpression";

import { getDBSessionForSubdomain } from "../session/getSessionForSubdomain";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function fetchDataFromDB(
  expression: NestedExpression,
  context: EvalExpressionContext & { adminui?: boolean } & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
  _permissionCheck = true,
): Promise<ServerResult> {
  "use server";
  let dbSession: Session;
  let _subDomain = "";
  // @ts-expect-error ignore
  if (expression.adminui) {
    context.adminui = true;
  }

  if (context.dbSession) {
    dbSession = context.dbSession;
  } else {
    ({ dbSession, _subDomain } = await getDBSessionForSubdomain(
      context.adminui
        ? ({ url: "http://localhost/?adminui=true" } as Request)
        : undefined,
    ));
    context.dbSession = dbSession;
  }

  // if (permissionCheck) {
  //   const authorizationError = await checkAdminUserAuthorization(
  //     subDomain,
  //     dbSession,
  //   );
  //   if (authorizationError) {
  //     return authorizationError;
  //   }
  // }
  try {
    const mainResult = await evalExpressionAsync(
      expression.expression,
      context,
    );

    await processIncomingOutgoingExpressions(expression, mainResult, context);

    return {
      graph: {
        edges: context.relationships!,
        vertexes: context.nodes!,
      },
      result: mainResult,
    };
  } catch (error: any) {
    console.error(
      "Error in fetchDataFromDB:",
      expression.expression,
      error,
      error.cause,
    );
    return { error: error.message };
  }
}

async function processIncomingOutgoingExpressions(
  expression: NestedExpression,
  mainResult: Vertex[],
  context: EvalExpressionContext,
) {
  if (expression.incoming && mainResult && mainResult.length > 0) {
    for (const exp of expression.incoming) {
      context.vertexes = [...mainResult];
      await fetchDataFromDB(exp, context);
    }
  }
  if (expression.outgoing && mainResult && mainResult.length > 0) {
    for (const exp of expression.outgoing) {
      context.vertexes = [...mainResult];
      await fetchDataFromDB(exp, context);
    }
  }
}
