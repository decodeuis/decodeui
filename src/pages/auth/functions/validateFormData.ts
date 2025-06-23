import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";
import type { Vertex } from "~/lib/graph/type/vertex";

type ShowErrorToast = (message: string) => void;
type ValidationOptions = {
  allowEmailOrUsername?: boolean;
  requireEmail?: boolean;
  requirePassword?: boolean;
  requireUsername?: boolean;
};

/**
 * Validates form data for auth forms
 * @param formData - The form data to validate
 * @param showErrorToast - Function to display error toast
 * @param options - Validation options
 * @returns boolean indicating if validation passed
 */
export function validateFormData(
  formData: Vertex,
  showErrorToast: ShowErrorToast,
  options: ValidationOptions = {
    allowEmailOrUsername: false,
    requireEmail: true,
    requirePassword: true,
    requireUsername: false,
  },
): boolean {
  const { email, password, username } = formData.P;

  // Validate username if required
  if (options.requireUsername) {
    const usernameError = validateUsername(username);
    if (usernameError) {
      showErrorToast(usernameError);
      return false;
    }
  }

  // Validate email or username/email field
  if (options.requireEmail) {
    if (options.allowEmailOrUsername && email) {
      if (email.includes("@")) {
        const emailError = validateEmail(email);
        if (emailError) {
          showErrorToast("Enter valid email or username");
          return false;
        }
      } else {
        const usernameError = validateUsername(email);
        if (usernameError) {
          showErrorToast("Enter valid email or username");
          return false;
        }
      }
    } else {
      const emailError = validateEmail(email);
      if (emailError) {
        showErrorToast(emailError);
        return false;
      }
    }
  }

  // Validate password if required
  if (options.requirePassword) {
    const passwordError = validatePassword(password);
    if (passwordError) {
      showErrorToast(passwordError);
      return false;
    }
  }

  return true;
}
