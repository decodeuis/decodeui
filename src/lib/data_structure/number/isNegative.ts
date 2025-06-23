import { isNumber } from "./isNumber";

export function isNegative(value: number | string) {
  const numericValue = Number(value);
  return isNumber(numericValue) ? numericValue < 0 : false;
}
