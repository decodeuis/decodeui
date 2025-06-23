import { createStore } from "solid-js/store";

/**
 * Custom hook to manage password visibility state
 * @param fields - Array of field names to track visibility for
 * @returns [state, toggle function]
 */
export function usePasswordVisibility(fields: string[] = ["password"]) {
  // Create initial state object with all fields set to false
  const initialState = fields.reduce(
    (acc, field) => {
      acc[field] = false;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  const [showPassword, setShowPassword] = createStore(initialState);

  // Toggle visibility for a specific field
  const toggleVisibility = (field: string) => {
    if (field in showPassword) {
      setShowPassword(field, !showPassword[field]);
    }
  };

  return [showPassword, toggleVisibility] as const;
}
