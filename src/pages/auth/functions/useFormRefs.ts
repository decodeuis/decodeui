import { createStore } from "solid-js/store";

/**
 * Custom hook to manage form input references
 * @param refNames - Array of ref names to track
 * @returns [refs object, setRef function]
 */
export function useFormRefs<T extends string>(refNames: T[]) {
  // Create initial state with all refs set to null
  const initialState = refNames.reduce(
    (acc, name) => {
      acc[name] = null;
      return acc;
    },
    {} as Record<T, HTMLInputElement | null>,
  );

  const [formRefs, setFormRefs] = createStore(initialState);

  // Helper to set a specific ref
  const setRef = (name: T, ref: HTMLInputElement | null) => {
    setFormRefs(name, ref);
  };

  return [formRefs, setRef] as const;
}
