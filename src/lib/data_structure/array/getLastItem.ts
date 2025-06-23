export function getLastItem<T>(arr: T[], index = 1): T | undefined {
  return arr[arr.length - index];
}
