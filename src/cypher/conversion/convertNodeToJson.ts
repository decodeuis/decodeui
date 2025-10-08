import type { Node, Relationship } from "neo4j-driver";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { types } from "neo4j-driver";

import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";

// typed-neo4j/src/convert.ts
export const neo4jConvert = {
  /** Convert Neo4j types to JS types */
  // need to handle all types as server cant send class to client and gives error
  js: (value: any): any => {
    if (value instanceof types.DateTime) {
      return value.toStandardDate().toISOString();
    }
    if (value instanceof types.LocalDateTime) {
      return value.toStandardDate().toISOString();
    }
    if (value instanceof types.Date) {
      return value.toStandardDate().toISOString().split('T')[0]; // Return YYYY-MM-DD format for Neo4j Date
    }
    if (value instanceof types.Time) {
      return value.toString();
    }
    if (value instanceof types.LocalTime) {
      return value.toString();
    }
    if (value instanceof types.Integer) {
      //return value.toBigInt();
      return value.toNumber();// loss precision for big number
    }
    if (Array.isArray(value)) {
      return value.slice().map(neo4jConvert.js);
    }
    if (typeof value === "object") {
      const result: Record<string, any> = {};
      for (const key in value) {
        result[key] = neo4jConvert.js(value[key]);
      }
      return result;
    }
    return value;
  },
  /** Convert JS types to Neo4j types */
  neo4j: (value: any): any => {
    if (value instanceof Date) {
      return types.DateTime.fromStandardDate(value);
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Convert YYYY-MM-DD string to Neo4j Date
      return types.Date.fromStandardDate(new Date(value + 'T00:00:00.000Z'));
    }
    if (value instanceof BigInt) {
      return types.Integer.fromString(value.toString());
    }
    if (Array.isArray(value)) {
      return value.slice().map(neo4jConvert.neo4j);
    }
    if (typeof value === "object") {
      const result: Record<string, any> = {};
      for (const key in value) {
        result[key] = neo4jConvert.neo4j(value[key]);
      }
      return result;
    }
    return value;
  },
};

/*function unwrapProperties(
  properties: Record<string, any>,
): Record<string, any> {
  if (Array.isArray(properties)) {
    return properties.map((item) => unwrapProperties(item));
  }
  const unwrapped: Record<string, any> = {};

  for (const key in properties) {
    if (properties[key] && typeof properties[key] === "object") {
      if ("low" in properties[key] && "high" in properties[key]) {
        // Assuming the property is a Neo4j Integer
        unwrapped[key] = properties[key]; //.toNumber(); // Convert to JavaScript number
        // There is isDateTime function in the Neo4j driver too
      } else if (
        "year" in properties[key] &&
        "month" in properties[key] &&
        "day" in properties[key] &&
        "hour" in properties[key] &&
        "minute" in properties[key] &&
        "second" in properties[key] &&
        "nanosecond" in properties[key]
      ) {
        const date = new Date(
          properties[key].year,
          properties[key].month - 1,
          properties[key].day,
          properties[key].hour,
          properties[key].minute,
          properties[key].second,
          Math.floor(properties[key].nanosecond / 1000000),
        );
        unwrapped[key] = date.toISOString();
      } else {
        // Recursively unwrap nested objects
        unwrapped[key] = unwrapProperties(properties[key]);
      }
    } else {
      unwrapped[key] = properties[key];
    }
  }

  return unwrapped;
}*/

// Functions to handle database values and convert them to JSON
export function convertNodeToJson(node: Node): Vertex {
  return {
    id: node.elementId,
    IN: node.IN || {},
    L: node.labels,
    OUT: node.OUT || {},
    P: neo4jConvert.js(node.properties),
  };
}

export function convertRelationshipToJson(relationship: Relationship): Edge {
  return {
    E: relationship.endNodeElementId,
    // when disableLosslessIntegers is false, we get object in number property.
    id: relationship.elementId,
    // Todo: data is not handled as properly, object is returned from server
    P: neo4jConvert.js(relationship.properties),
    S: relationship.startNodeElementId,
    T: relationship.type,
  };
}
