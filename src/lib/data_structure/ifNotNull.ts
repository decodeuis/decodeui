export function ifNotNull<T>(value: null | T): T | undefined {
  return value !== null ? value : undefined;
}
