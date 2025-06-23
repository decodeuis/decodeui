export function validateIdMap(idMap: any[]) {
  for (const idmap of idMap) {
    if (idmap.length !== 2) {
      return {
        error:
          "Invalid argument shape, vertexIdMap and EdgeIdMap each item is [num, num] tuple",
      };
    }
  }
  return { error: "" };
}
