export interface CypherQueryResult {
  params: { [key: string]: MongoValue };
  query: string;
}

// Define a type to replace 'any'
export type MongoValue =
  | string
  | number
  | boolean
  | null
  | Date
  | MongoValue[]
  | { [key: string]: MongoValue };

export type MongoFilter =
  | { $and?: MongoFilter[] }
  | { $not?: MongoFilter }
  | { $or?: MongoFilter[] }
  | { [key: string]: MongoValue }
  | {
      [key: string]: {
        $gt?: MongoValue;
        $gte?: MongoValue;
        $lt?: MongoValue;
        $lte?: MongoValue;
        $ne?: MongoValue;
        $in?: MongoValue[];
      };
    };

export function mongoToCypher(filter: MongoFilter): CypherQueryResult {
  if (!filter || Object.keys(filter).length === 0) {
    return {
      params: {},
      query: "",
    };
  }

  const params: { [key: string]: MongoValue } = {};
  let paramIndex = 0;

  const translateFilter = (filter: MongoFilter): string => {
    return Object.entries(filter)
      .map(([key, value]) => {
        if (key === "$and" && Array.isArray(value)) {
          return (
            "(" +
            value
              .map((item) => translateFilter(item as MongoFilter))
              .join(" AND ") +
            ")"
          );
        }
        if (key === "$or" && Array.isArray(value)) {
          return (
            "(" +
            value
              .map((item) => translateFilter(item as MongoFilter))
              .join(" OR ") +
            ")"
          );
        }
        if (key === "$not" && typeof value === "object") {
          return "NOT (" + translateFilter(value as MongoFilter) + ")";
        }
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return handleOperators(
            key,
            value as { [operator: string]: MongoValue },
          );
        }
        // Direct equality
        const paramName = `param${paramIndex++}`;
        params[paramName] = value;
        return `n.${key} = $${paramName}`;
      })
      .join(" AND ");
  };

  const handleOperators = (
    field: string,
    conditions: { [operator: string]: MongoValue },
  ): string => {
    return Object.entries(conditions)
      .map(([operator, value]) => {
        const paramName = `param${paramIndex++}`;
        params[paramName] = value;
        switch (operator) {
          case "$gt":
            return `n.${field} > $${paramName}`;
          case "$gte":
            return `n.${field} >= $${paramName}`;
          case "$lt":
            return `n.${field} < $${paramName}`;
          case "$lte":
            return `n.${field} <= $${paramName}`;
          case "$ne":
            return `n.${field} <> $${paramName}`;
          case "$in": {
            if (Array.isArray(value)) {
              return `n.${field} IN $${paramName}`;
            }
            throw new Error("$in operator requires an array value");
          }
          default:
            throw new Error(`Unsupported operator: ${operator}`);
        }
      })
      .join(" AND ");
  };

  const whereClause = translateFilter(filter);
  return {
    params,
    query: whereClause,
  };
}
