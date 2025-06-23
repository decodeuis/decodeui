import type { ValidationConfigType } from "./ValidationConfig";

export function validateInput(
  validation: ValidationConfigType,
  value?: number | string,
  fieldKey?: string,
  fieldLabel?: string,
) {
  const fieldName =
    fieldLabel ||
    (fieldKey ? fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1) : "Input");

  // Clear previous error
  // Check required rule
  if (
    validation.required &&
    (value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === ""))
  ) {
    return `${fieldName} is required`;
  }

  // Convert number to string for string-based validations
  const stringValue =
    value !== undefined && value !== null ? String(value) : "";

  // Check email rule
  if (validation.email && stringValue && !/\S+@\S+\.\S+/.test(stringValue)) {
    return `Invalid ${fieldName.toLowerCase()} format`;
  }

  // Check minLength rule
  if (
    validation.minLength &&
    stringValue &&
    stringValue.length < validation.minLength
  ) {
    return `${fieldName} should be at least ${validation.minLength} characters`;
  }

  // Check maxLength rule
  if (
    validation.maxLength &&
    stringValue &&
    stringValue.length > validation.maxLength
  ) {
    return `${fieldName} should be no more than ${validation.maxLength} characters`;
  }

  // Check regex rules
  if (validation.regex) {
    const regexRules = Array.isArray(validation.regex)
      ? validation.regex
      : [validation.regex];
    for (const element of regexRules) {
      const regexRule = element;
      if (regexRule.enabled) {
        if (!stringValue) {
          return (
            regexRule.message ||
            `${fieldName} does not match the required pattern`
          );
        }
        const regex = new RegExp(regexRule.value);
        if (!regex.test(stringValue)) {
          return (
            regexRule.message ||
            `${fieldName} does not match the required pattern`
          );
        }
      }
    }
  }

  // Check custom validation functions
  if (validation.validate) {
    const validateFunctions = Array.isArray(validation.validate)
      ? validation.validate
      : [validation.validate];

    for (const validateFn of validateFunctions) {
      const error = validateFn(stringValue);
      if (error) {
        return error;
      }
    }
  }

  return undefined;
}
