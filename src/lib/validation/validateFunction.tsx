/**
 * Validates if the provided function string is valid
 * @param value - The function string to validate
 * @param returnType - The expected return type of the function ("string" | "object")
 * @returns An object with validation result and error message if any
 */

export function validateFunction(
  value: string,
  returnType: "object" | "string" = "object",
): {
  error?: string;
  isValid: boolean;
} {
  try {
    if (!value) {
      return { isValid: true };
    }

    if (returnType === "object" && !value.includes("return {")) {
      return { error: "Function body must return an object", isValid: false };
    }

    if (returnType === "string") {
      return { isValid: true };
    }

    return { isValid: true };

    /* Original validation code:
    const func = new Function("args", `${value}`);
    if (typeof func === "function") {
      const result = func({});
      if (typeof result === "object") {
        return { isValid: true };
      } else {
        return { isValid: false, error: "Function did not return an object" };
      }
    } else {
      return { isValid: false, error: "Input is not a function" };
    }
    */
  } catch (error) {
    console.error("Error evaluating function:", error);
    return { error: (error as Error).message, isValid: false };
  }
}
