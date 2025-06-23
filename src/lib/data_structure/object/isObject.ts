export function isObject(i: any): i is Record<string, any> {
  if (i && !Array.isArray(i)) {
    return "object" === typeof i;
  }
  return !1;
}
