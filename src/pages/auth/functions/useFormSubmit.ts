import type { Navigator } from "@solidjs/router";

import { useToast } from "~/components/styled/modal/Toast";

import { handleSignInRedirect } from "./handleSignInRedirect";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

type SubmitOptions = {
  apiCall: (formData: any) => Promise<any>;
  loadMessage: string;
  navigate?: Navigator;
  onError?: (error: any) => void;
  onSuccess?: (value: any) => void;
  shouldRedirect?: boolean;
  successMessage: string;
  validateFn?: (formData: Vertex) => boolean;
};

/**
 * Custom hook to handle form submission with loading toast
 * @returns submitForm function
 */
export function useFormSubmit() {
  const [graph] = useGraph();
  const { showErrorToast, showLoadingToast } = useToast();

  /**
   * Submit form with loading toast
   * @param formData - The form data to submit
   * @param options - Submission options
   */
  const submitForm = async (formData: Vertex, options: SubmitOptions) => {
    // Validate form data if validation function is provided
    if (options.validateFn && !options.validateFn(formData)) {
      return;
    }

    // Default success handler that handles signIn redirect if needed
    const defaultSuccessHandler = (value: any) => {
      if (options.shouldRedirect && options.navigate) {
        handleSignInRedirect(value?.result, graph, options.navigate);
      }

      // Call custom success handler if provided
      if (options.onSuccess) {
        options.onSuccess(value);
      }
    };

    // Show loading toast and handle API call
    await showLoadingToast({
      loadMessage: options.loadMessage,
      onError: options.onError || (() => {}),
      onSuccess: defaultSuccessHandler,
      promise: options.apiCall(formData),
      successMessage: options.successMessage,
    });
  };

  return { showErrorToast, submitForm };
}
