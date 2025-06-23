import { isObject } from "~/lib/data_structure/object/isObject";

import type { MutationArgs } from "../../../../types/MutationArgs";

import { validateIdMap } from "./validateIdMap";
import { validateMutationObjects } from "./validateMutationObjects";

export function mutateArgsValidation(args: MutationArgs): any {
  const responseResult = [] as any[];

  if (!isObject(args)) {
    return {
      error:
        "Invalid argument shape, the inner argument to sync(mutate) must be an array",
    };
  }

  const requiredKeys = ["txnId", "vertexIdMap", "edgeIdMap", "transactions"];
  for (const key of requiredKeys) {
    if (!args.hasOwnProperty(key)) {
      return { error: `Invalid argument shape, missing required key: ${key}` };
    }
  }
  if (!(Array.isArray(args.vertexIdMap) && Array.isArray(args.edgeIdMap))) {
    return {
      error:
        "Invalid argument shape, the inner argument to sync(mutate) must be an array and it should contain 4 elements. vertexIdMap and EdgeIdMap each item is [num, num] tuple",
    };
  }
  const vertexValidationResult = validateIdMap(args.vertexIdMap);
  if (vertexValidationResult.error) {
    return vertexValidationResult;
  }
  const edgeValidationResult = validateIdMap(args.edgeIdMap);
  if (edgeValidationResult.error) {
    return edgeValidationResult;
  }
  if (!validateMutationObjects(args.transactions)) {
    return responseResult;
  }

  return responseResult;
}
