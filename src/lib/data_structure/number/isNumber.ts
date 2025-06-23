// https://www.npmjs.com/package/@annexe/number.isnegative
export function isNumber(value: unknown): value is number {
  return (
    value !== null &&
    !Number.isNaN(value as number) &&
    Number.isFinite(value as number)
  );
}
