// https://github.com/d4nyll/rundef/blob/master/index.js
export function removeUndefinedProperties(
  obj: { [key: string]: any },
  mutate = false,
  recursive = 0,
) {
  const returnObj = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      if (mutate) {
        delete obj[key];
      }
    } else {
      let recursiveVal;
      if (recursive > 0 && val !== null && typeof val === "object") {
        recursiveVal = removeUndefinedProperties(
          val,
          mutate,
          // @ts-expect-error
          typeof recursive === "number" ? recursive - 1 : true,
        );
      }
      if (!mutate) {
        // @ts-expect-error
        returnObj[key] = recursiveVal || val;
      }
    }
  }
  return mutate ? obj : returnObj;
}
