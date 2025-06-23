import { isObject } from "~/lib/data_structure/object/isObject";

import { isProperEdgeFormat } from "./isProperEdgeFormat";
import { isProperNodeFormat } from "./isProperNodeFormat";

export function validateMutationObjects(mutationObjects: any[]) {
  const mutationTypes = ["insert", "replace", "merge", "deleteVertex"];
  const edgeMutationTypes = ["insertEdge", "replaceEdge", "deleteEdge"];

  for (const mutationObject of mutationObjects) {
    for (const key of mutationTypes) {
      if (key in mutationObject && !isObject(mutationObject[key])) {
        return { error: `${key} shape must be an object` };
      }
      if (key in mutationObject) {
        const err = isProperNodeFormat(mutationObject[key]);
        if (err) {
          return { error: `${key} ${err}` };
        }
      }
    }
    for (const key of edgeMutationTypes) {
      if (key in mutationObject && !isObject(mutationObject[key])) {
        return { error: `${key} shape must be an object` };
      }
      if (key in mutationObject) {
        const err = isProperEdgeFormat(mutationObject[key]);
        if (err) {
          return { error: `${key} ${err}` };
        }
      }
    }
  }
  return true;
}
