// JavaScript Expression Parser
import jsep from "jsep";
// https://github.com/donmccurdy/expression-eval
import { path } from "rambda";

//import { eval as eval1} from 'expression-eval';

import {
  evalGetChildren,
  evalGetParents,
  evalGlobalColl,
  evalVertexById,
} from "~/cypher/queries/evaluate/evalFunctions";
import { getLabelFilterSkipLimit } from "~/cypher/queries/evaluate/getLabelFilterSkipLimit";
import { findVertexIdsByLabel } from "~/lib/graph/get/sync/entity/findVertex";

import { isObject } from "./data_structure/object/isObject";
import { getTextValue } from "./graph/get/sync/format/getTextValue";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Evaluation code from JSEP project, under MIT License.
 * Copyright (c) 2013 Stephen Oney, http://jsep.from.so/
 */

// Default operator precedence from https://github.com/EricSmekens/jsep/blob/master/src/jsep.js#L55
const _DEFAULT_PRECEDENCE = {
  "!=": 6,
  "!==": 6,
  "%": 10,
  "&": 5,
  "&&": 2,
  "*": 10,
  "+": 9,
  "-": 9,
  "/": 10,
  "<": 7,
  "<<": 8,
  "<=": 7,
  "==": 6,
  "===": 6,
  ">": 7,
  ">=": 7,
  ">>": 8,
  ">>>": 8,
  "^": 4,
  "|": 3,
  "||": 1,
};

export const binopsInitial = {
  "!=": (a, b) => a !== b, // jshint ignore:line
  "!==": (a, b) => a !== b,
  "%": (a, b) => a % b,
  "&": (a, b) => a & b,
  "&&": (a, b) => a && b,
  "*": (a, b) => a * b,
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "/": (a, b) => a / b,
  "<": (a, b) => a < b,
  "<<": (a, b) => a << b,
  "<=": (a, b) => a <= b,
  "==": (a, b) => a === b, // jshint ignore:line
  "===": (a, b) => a === b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  ">>": (a, b) => a >> b,
  ">>>": (a, b) => a >>> b,
  "^": (a, b) => a ^ b,
  "|": (a, b) => a | b,
  "||": (a, b) => a || b,
} as { [key: string]: (v1: any, v2: any, context: object) => any };

export const binops = { ...binopsInitial };

export const unaryOperatorsInitial = {
  "!": (a) => !a,
  "+": (a) => +a,
  "-": (a) => -a,
  "~": (a) => ~a,
} as { [key: string]: (v: any, context: any) => any };

export const unops = { ...unaryOperatorsInitial };

declare type binaryCallback = (
  a: operand,
  b: operand,
  context: object,
) => operand;
declare type operand = any | number | string;
declare type unaryCallback = (a: operand, context: object) => operand;

// Added functions to inject Custom Binary Operators (and override existing ones)
// modified function for simple to use
export function addBinaryOp(
  operator: string,
  precedence: number,
  rightToLeft: boolean,
  _function: binaryCallback,
  _asyncFunction?: binaryCallback,
): void {
  jsep.addBinaryOp(operator, precedence, rightToLeft);
  binops[operator] = _function;
  if (_asyncFunction) {
    binops[`${operator}_async`] = _asyncFunction;
  }
}

// Added functions to inject Custom Unary Operators (and override existing ones)
export function addUnaryOp(
  operator: string,
  _function: unaryCallback,
  _asyncFunction?: unaryCallback,
): void {
  jsep.addUnaryOp(operator);
  unops[operator] = _function;
  if (_asyncFunction) {
    unops[`${operator}_async`] = _asyncFunction;
  }
}

export function compile(
  expression: jsep.Expression | string,
): (context: object) => any {
  return evaluate.bind(null, jsep(expression));
}

export function compileAsync(
  expression: jsep.Expression | string,
): (context: object) => Promise<any> {
  return evalAsync.bind(null, jsep(expression));
}

export async function evalAsync(
  _node: jsep.Expression,
  context: object,
): Promise<any> {
  const node = _node as jsep.CoreExpression;

  // Brackets used for some case blocks here, to avoid edge cases related to variable hoisting.
  // See: https://stackoverflow.com/questions/57759348/const-and-let-variable-shadowing-in-a-switch-statement
  switch (node.type) {
    case "ArrayExpression":
      return await evaluateArrayAsync(node.elements, context);

    case "BinaryExpression": {
      if (node.operator === "||") {
        return (
          (await evalAsync(node.left, context)) ||
          (await evalAsync(node.right, context))
        );
      }
      if (node.operator === "&&") {
        return (
          (await evalAsync(node.left, context)) &&
          (await evalAsync(node.right, context))
        );
      }
      const [left, right] = await Promise.all([
        evalAsync(node.left, context),
        evalAsync(node.right, context),
      ]);

      if (binops[`${node.operator}_async`]) {
        return binops[`${node.operator}_async`](left, right, context);
      }

      return binops[node.operator](left, right, context);
    }

    case "CallExpression": {
      let caller;
      let fn;
      let assign;
      if (node.callee.type === "MemberExpression") {
        assign = await evaluateMemberAsync(
          node.callee as jsep.MemberExpression,
          context,
        );
        caller = assign[0];
        fn = assign[1];
      } else {
        fn = await evalAsync(node.callee, context);
      }
      if (typeof fn !== "function") {
        return undefined;
      }
      return await fn.apply(
        caller,
        await evaluateArrayAsync(node.arguments, context),
      );
    }

    case "ConditionalExpression":
      return (await evalAsync(node.test, context))
        ? await evalAsync(node.consequent, context)
        : await evalAsync(node.alternate, context);

    case "Identifier":
      // return context[node.name];
      return node.name;

    case "Literal":
      return node.value;

    case "MemberExpression":
      return (await evaluateMemberAsync(node, context))[1];

    case "ThisExpression":
      return context;

    case "UnaryExpression": {
      if (unops[`${node.operator}_async`]) {
        return unops[`${node.operator}_async`](
          await evalAsync(node.argument, context),
          context,
        );
      }
      return unops[node.operator](
        await evalAsync(node.argument, context),
        context,
      );
    }

    default:
      return undefined;
  }
}

export function evaluate(_node: jsep.Expression, context: object): any {
  const node = _node as jsep.CoreExpression;

  switch (node.type) {
    case "ArrayExpression":
      return evaluateArray(node.elements, context);

    case "BinaryExpression": {
      if (node.operator === "||") {
        return evaluate(node.left, context) || evaluate(node.right, context);
      }
      if (node.operator === "&&") {
        return evaluate(node.left, context) && evaluate(node.right, context);
      }
      return binops[node.operator](
        evaluate(node.left, context),
        evaluate(node.right, context),
        context,
      );
    }

    case "CallExpression": {
      let caller;
      let fn;
      let assign;
      if (node.callee.type === "MemberExpression") {
        assign = evaluateMember(node.callee as jsep.MemberExpression, context);
        caller = assign[0];
        fn = assign[1];
      } else {
        fn = evaluate(node.callee, context);
      }
      if (typeof fn !== "function") {
        return undefined;
      }
      return fn.apply(caller, evaluateArray(node.arguments, context));
    }

    case "ConditionalExpression":
      return evaluate(node.test, context)
        ? evaluate(node.consequent, context)
        : evaluate(node.alternate, context);

    case "Identifier":
      // return context[node.name];
      return node.name;

    case "Literal":
      return node.value;

    case "MemberExpression":
      return evaluateMember(node, context)[1];

    case "ThisExpression":
      return context;

    case "UnaryExpression":
      return unops[node.operator](evaluate(node.argument, context), context);

    default:
      return undefined;
  }
}

// https://github.com/EricSmekens/jsep/blob/29049a0704b4a4e5d52b479ed72615c04adf81ec/src/jsep.js#L934
export function getChildrenUnaray(collection: string, context: object) {
  if (/^\$[1-9]+[0-9]*$/.test(collection)) {
    const numericValue = Number.parseInt(collection.slice(1));
    const vertex = context.vertexes[numericValue - 1];
    if (vertex) {
      return [vertex];
    }
    return [];
  }
  return binops["->"](context.vertexes, collection, context);
}

export function getChildrenUnarayAsync(collection: string, context: object) {
  if (/^\$[1-9]+[0-9]*$/.test(collection)) {
    const numericValue = Number.parseInt(collection.slice(1));
    const vertex = context.vertexes[numericValue - 1];
    if (vertex) {
      return [vertex];
    }
    return [];
  }
  return binops["->_async"](context.vertexes, collection, context);
}

function evaluateArray(list: jsep.Expression[], context: object) {
  return list.map((v) => evaluate(v, context));
}

async function evaluateArrayAsync(list: jsep.Expression[], context: object) {
  const res = await Promise.all(list.map((v) => evalAsync(v, context)));
  return res;
}

function evaluateMember(node: jsep.MemberExpression, context: object) {
  const object = evaluate(node.object, context);
  let key: string;
  if (node.computed) {
    key = evaluate(node.property, context);
  } else {
    key = (node.property as jsep.Identifier).name;
  }
  if (/^__proto__|prototype|constructor$/.test(key)) {
    throw Error(`Access to member "${key}" disallowed.`);
  }
  return [object, object[key]];
}

async function evaluateMemberAsync(
  node: jsep.MemberExpression,
  context: object,
) {
  const object: any = await evalAsync(node.object, context);
  let key: string;
  if (node.computed) {
    key = await evalAsync(node.property, context);
  } else {
    key = (node.property as jsep.Identifier).name;
  }
  if (/^__proto__|prototype|constructor$/.test(key)) {
    throw Error(`Access to member "${key}" disallowed.`);
  }
  return [object, object[key]];
}

addUnaryOp("->", getChildrenUnaray, getChildrenUnarayAsync);
// Projection Operator
addBinaryOp("::", 11, false, projectedValueBinOps);

addBinaryOp(
  "->",
  12,
  false,
  (vertexes, edgeType, context) => {
    if (!vertexes) {
      return;
    }
    if (!Array.isArray(vertexes)) {
      vertexes = [vertexes];
    }
    const stepVertexes = new Map<number, Vertex>();

    for (const currentVertex of vertexes) {
      if (!currentVertex) {
        continue;
      }
      const type = edgeType.replaceAll("$0", currentVertex.L[0]);

      const edgeIds = currentVertex.OUT[type] || [];
      if (edgeIds.length === 0) {
        const strict = true;
        // we only return error if its in middle of path
        if (strict && path.length > 1) {
          return;
        }
        continue;
      }
      for (const edgeId of edgeIds) {
        const edge = context.graph.edges[edgeId];
        if (edge) {
          const newVertex = context.graph.vertexes[edge.E];
          if (newVertex) {
            stepVertexes.set(newVertex.id, newVertex);
          } else {
            return;
          }
        } else {
          return;
        }
      }
    }
    return Array.from(stepVertexes.values());
  },
  evalGetChildren,
);

export function getPraents(collection: string, context: object) {
  if (/^\$[1-9]+[0-9]*$/.test(collection)) {
    const numericValue = Number.parseInt(collection.slice(1));
    const vertex = context.vertexes[numericValue - 1];
    if (vertex) {
      return [vertex];
    }
    return [];
  }
  return binops["<-"](context.vertexes, collection, context);
}

export async function getPraentsAsync(collection: string, context: object) {
  if (/^\$[1-9]+[0-9]*$/.test(collection)) {
    const numericValue = Number.parseInt(collection.slice(1));
    const vertex = context.vertexes[numericValue - 1];
    if (vertex) {
      return [vertex];
    }
    return [];
  }
  return binops["<-_async"](context.vertexes, collection, context);
}

addUnaryOp("<-", getPraents, getPraentsAsync);
addUnaryOp(
  "id:",
  (id: string, context: object) => {
    const ids = id.split(",");
    return ids.map((id) => context.graph.vertexes[id]);
  },
  evalVertexById,
);

addBinaryOp(
  "<-",
  12,
  false,
  (vertexes, edgeType, context) => {
    if (!vertexes) {
      return;
    }
    if (!Array.isArray(vertexes)) {
      vertexes = [vertexes];
    }
    const stepVertexes = new Map<number, Vertex>();

    for (const currentVertex of vertexes) {
      if (!currentVertex) {
        continue;
      }
      const type = edgeType.replaceAll("$0", currentVertex.L[0]);

      const edgeIds = currentVertex.IN[type];
      if (!edgeIds) {
        continue;
      }

      for (const edgeId of edgeIds) {
        const edge = context.graph.edges[edgeId];
        if (edge) {
          const newVertex = context.graph.vertexes[edge.S];
          if (newVertex) {
            stepVertexes.set(newVertex.id, newVertex);
          } else {
            return;
          }
        } else {
          return;
        }
      }
    }
    return Array.from(stepVertexes.values());
  },
  evalGetParents,
);
addBinaryOp("++", 13, true, (vertexes1, vertexes2) => {
  return [
    ...(Array.isArray(vertexes1) ? vertexes1 : []),
    ...(Array.isArray(vertexes2) ? vertexes2 : []),
  ];
});
addUnaryOp("json:", (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    console.warn(e);
    return;
  }
});

addUnaryOp(
  "g:",
  (edgeType, context) => {
    const { filter, label, limit, skip } = getLabelFilterSkipLimit(
      edgeType,
      context,
    );

    if (filter && Object.keys(filter).length > 0) {
      const vertexIds = findVertexIdsByLabel(context.graph, label);
      const filteredVertexes = [];
      for (const vertexId of vertexIds) {
        const vertex = context.graph.vertexes[vertexId];
        let matchesFilter = true;
        for (const key in filter) {
          if (vertex.P[key] !== filter[key]) {
            matchesFilter = false;
            break;
          }
        }
        if (matchesFilter) {
          filteredVertexes.push(vertex);
        }
      }
      return filteredVertexes;
    }
    return findVertexIdsByLabel(context.graph, edgeType).map(
      (id) => context.graph.vertexes[id],
    );
  },
  evalGlobalColl,
);

/*addUnaryOp("ids:", (edgeType: string | number | string[] | Vertex[], context) => {
  if (typeof edgeType === "number") {
    return context.graph.vertexes[edgeType];
  } else if (typeof edgeType === "string") {
    return edgeType
      .split(",")
      .map((id) => context.graph.vertexes[id])
      .filter((x) => x);
  } else if (Array.isArray(edgeType)) {
    if (edgeType.length === 0) {
      return [];
    } else if (
      typeof edgeType[0] === "string" ||
      typeof edgeType[0] === "number"
    ) {
      return edgeType.map((id) => context.graph.vertexes[id]).filter((x) => x);
    }
  }
});*/
// use like T:(A->B->C)
addUnaryOp("T:", (value: any) => {
  return getTextValue(value);
});
addUnaryOp("::", projectedValueUnOps);

export function evalExpression(expression: string, context: object) {
  return evaluate(jsep(expression), context);
}

export function evalExpressionAsync(expression: string, context: object) {
  return evalAsync(jsep(expression), context);
}

function getVertexBinOps(context: any): any {
  if (Array.isArray(context)) {
    return context[0] || {};
  }
  if (isObject(context)) {
    return context;
  }
  return {};
}

//
// unops['id:'] = (id, context) => {
//
//     let idValue;
//     if (Array.isArray(id)) {
//         idValue = id[0] || {};
//     } else if (G.isObject(id)) {
//         idValue = id.id;
//     } else {
//         idValue = id;
//     }
//
//     return idValue;
// }

function getVertexUnOps(context: any): any {
  if (Array.isArray(context?.vertexes)) {
    return context.vertexes[0] || {};
  }
  if (isObject(context?.vertexes)) {
    return context.vertexes;
  }
  return context || {};
}

function projectedValueBinOps(vertexes1: any, projection: string): any {
  const resolvedProjection = resolveProjection(projection, vertexes1);
  const vertex = getVertexBinOps(vertexes1);
  return getTextValue(path(resolvedProjection)(vertex));
}

function projectedValueUnOps(projection: any, context: any) {
  const resolvedProjection = resolveProjection(projection, context);
  const vertex = getVertexUnOps(context);
  return getTextValue(path(resolvedProjection)(vertex));
}

function resolveProjection(projection: string, context: any): string {
  // Check if the projection contains any variable references
  // Example: If projection is "$variableName", it will be processed to retrieve its value.
  const variableMatch = projection.match(/\$([A-Za-z][\w+]?[:\w.]*)/g);
  if (variableMatch) {
    return projection.replace(
      /\$([A-Za-z][\w+]?[:\w.]*)/g,
      (_match: string, p1: string, _offset: number, _string: string) =>
        projectedValueUnOps(p1, context),
    );
  }
  return projection;
}
