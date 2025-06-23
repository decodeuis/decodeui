import { FormMetaData } from "~/lib/meta/formMetaData";

/* eslint-disable perfectionist/sort-objects */
export const reservedKeywords = {
  clauses: [
    "CALL",
    "CREATE",
    "DELETE",
    "DETACH",
    "FOREACH",
    "LOAD",
    "MATCH",
    "MERGE",
    "OPTIONAL",
    "REMOVE",
    "RETURN",
    "SET",
    "START",
    "UNION",
    "UNWIND",
    "WITH",
  ],
  subclauses: ["LIMIT", "ORDER", "SKIP", "WHERE", "YIELD"],
  modifiers: [
    "ASC",
    "ASCENDING",
    "ASSERT",
    "BY",
    "CSV",
    "DESC",
    "DESCENDING",
    "ON",
  ],
  expressions: ["ALL", "CASE", "COUNT", "ELSE", "END", "WHEN", "THEN"],
  operators: [
    "AND",
    "AS",
    "CONTAINS",
    "DISTINCT",
    "IN",
    "IS",
    "NOT",
    "OR",
    "STARTS",
    "XOR",
  ],
  schema: [
    "CONSTRAINT",
    "CREATE",
    "DROP",
    "EXISTS",
    "INDEX",
    "NODE",
    "KEY",
    "UNIQUE",
  ],
  hints: ["USING", "JOIN", "SCAN", "SEEK"],
  literals: ["false", "null", "true"],
  reservedForFutureUse: [
    "ADD",
    "DO",
    "FOR",
    "MANDATORY",
    "OF",
    "REQUIRE",
    "SCALAR",
  ],
  added: [
    "key",
    "id",
    "type",
    "label",
    "Form",
    "Component",
    "Html",
    "Data",
    "Slot",
  ],
};

export function isReservedKeyword(key: string) {
  const formMetaDataKeys = Object.keys(FormMetaData);
  if (formMetaDataKeys.includes(key)) {
    return true;
  }
  for (const category in reservedKeywords) {
    if (
      reservedKeywords[category as keyof typeof reservedKeywords].includes(
        key.toUpperCase(),
      )
    ) {
      return true;
    }
  }
  return false;
}
