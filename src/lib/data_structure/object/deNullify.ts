export function deNullify<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(obj)) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key as keyof T] = obj[key];
    }
  }

  return result;
}
