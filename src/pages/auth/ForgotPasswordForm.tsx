import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getErrorSchema } from "~/lib/schema/getErrorSchema";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validatePassword } from "~/lib/validation/validatePassword";

import { SchemaRenderer } from "../SchemaRenderer";
import { PROPERTIES, SETTINGS_CONSTANTS } from "../settings/constants";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createFormSubmitButton } from "~/pages/auth/functions/schema/createFormSubmitButton";
import { createLinkButton } from "~/pages/auth/functions/schema/createLinkButton";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";

// Define interfaces for API responses
interface PasswordResetRequestResponse {
  success: boolean;
  message?: string;
  email?: string;
  userUuid?: string;
  resetSessionToken?: string;
  error?: string;
}

interface PasswordResetVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface PasswordResetCompleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Define types for the state stores
type StageDataStore = ReturnType<
  typeof createStore<{
    name: number;
  }>
>;

type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with contextData
interface ForgotPasswordFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    stageData: StageDataStore;
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [showPassword, toggleVisibility] = usePasswordVisibility([
    "newPassword",
    "confirmPassword",
  ]);

  // Store user data and session data for the entire flow
  const [userState, setUserState] = createStore({
    email: "", // Keep email for display purposes only
    resetSessionToken: "",
    userUuid: "", // Store UUID instead of relying on email for identification
  });

  const handleIdentifierSubmit = async (
    options: ForgotPasswordFunctionArgumentType,
  ) => {
    const identifier = options.data?.P?.identifier;
    if (!identifier?.trim()) {
      showErrorToast("Enter email or username");
      return;
    }

    try {
      // Send password reset request
      const result = (await postAPI(API.auth.passwordReset.requestUrl, {
        identifier,
      })) as PasswordResetRequestResponse;

      if (!result.success) {
        showErrorToast(result.message || "Failed to send reset email");
        return;
      }

      // Store the email for display purposes
      if (result.email) {
        setUserState("email", result.email);
      }

      // Store the UUID for secure identification in subsequent requests
      if (result.userUuid) {
        setUserState("userUuid", result.userUuid);

        // For additional security, store in sessionStorage (cleared when browser is closed)
        sessionStorage.setItem("resetUserUuid", result.userUuid);
      }

      // Store the session token for later verification steps
      if (result.resetSessionToken) {
        setUserState("resetSessionToken", result.resetSessionToken);

        // For additional security, store in sessionStorage (cleared when browser is closed)
        sessionStorage.setItem("resetSessionToken", result.resetSessionToken);
      }

      showSuccessToast("Reset instructions sent to your email");
      options.contextData.stageData[1]("name", 1);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handleOtpSubmit = async (
    options: ForgotPasswordFunctionArgumentType,
  ) => {
    const otp = options.data?.P?.otp;
    if (!otp?.trim()) {
      showErrorToast("Please enter OTP");
      return;
    }

    // Get user UUID and session token from state or session storage as fallback
    const userUuid =
      userState.userUuid || sessionStorage.getItem("resetUserUuid");
    const resetSessionToken =
      userState.resetSessionToken ||
      sessionStorage.getItem("resetSessionToken");

    if (!(userUuid && resetSessionToken)) {
      showErrorToast(
        "Session expired. Please restart the password reset process.",
      );
      return;
    }

    try {
      // Verify the OTP
      const result = (await postAPI(API.auth.passwordReset.verifyOtpUrl, {
        otp,
        resetSessionToken,
        userUuid,
      })) as PasswordResetVerifyResponse;

      if (!result.success) {
        showErrorToast(result.message || "Invalid or expired OTP");
        return;
      }

      showSuccessToast("OTP verified successfully");
      options.contextData.stageData[1]("name", 2);
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  const handlePasswordResetSubmit = async (
    options: ForgotPasswordFunctionArgumentType,
  ) => {
    const newPassword = options.data?.P?.newPassword;
    const confirmPassword = options.data?.P?.confirmPassword;

    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match");
      return false;
    }

    const passwordError = validatePassword(newPassword as string);
    if (passwordError) {
      showErrorToast(passwordError);
      return false;
    }

    // Get user UUID and session token from state or session storage as fallback
    const userUuid =
      userState.userUuid || sessionStorage.getItem("resetUserUuid");
    const resetSessionToken =
      userState.resetSessionToken ||
      sessionStorage.getItem("resetSessionToken");

    if (!(userUuid && resetSessionToken)) {
      showErrorToast(
        "Session expired. Please restart the password reset process.",
      );
      return false;
    }

    try {
      // Reset the password
      const result = (await postAPI(API.auth.passwordReset.completeUrl, {
        newPassword,
        resetSessionToken,
        userUuid,
      })) as PasswordResetCompleteResponse;

      if (!result.success) {
        showErrorToast(result.message || "Failed to reset password");
        return false;
      }

      // Clear session storage
      sessionStorage.removeItem("resetUserUuid");
      sessionStorage.removeItem("resetSessionToken");

      showSuccessToast("Password has been reset successfully");

      // Redirect to signIn page after successful reset
      setTimeout(() => {
        navigate(API.urls.admin.signIn);
      }, 3000);

      return true;
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      return false;
    }
  };

  // Step 1: Enter email/username
  const stepUserNameSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Reset Password"),
      {
        attributes: [
          ...createTextField(
            "identifier",
            "Email or Username",
            async (options: ForgotPasswordFunctionArgumentType) => {
              try {
                options.contextData.submitState[1]("isLoading", true);
                await handleIdentifierSubmit(options);
              } finally {
                options.contextData.submitState[1]("isLoading", false);
              }
            },
          ),
          createFormSubmitButton(
            (options: ForgotPasswordFunctionArgumentType) =>
              options.contextData.submitState[0]?.isLoading
                ? "Sending..."
                : "Confirm",
            async (options: ForgotPasswordFunctionArgumentType) => {
              await handleIdentifierSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Sign In",
            () => {
              navigate(API.urls.admin.signIn);
            },
          ),
        ],
        componentName: "Html",
      },
    ],
    componentName: "Html",
  };

  // Step 2: Enter OTP
  const stepOTPSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Verify OTP"),
      {
        attributes: [
          {
            as: "div",
            css: `return \`._id {
  text-align: center;
  margin-bottom: 16px;
}\`;`,
            componentName: "Html",
            text: `We've sent a verification code to ${userState.email || "your email"}. Please enter it below.`,
          },
          ...createTextField(
            "otp",
            "One Time Password (OTP)",
            async (options: ForgotPasswordFunctionArgumentType) => {
              try {
                options.contextData.submitState[1]("isLoading", true);
                await handleOtpSubmit(options);
              } finally {
                options.contextData.submitState[1]("isLoading", false);
              }
            },
            undefined,
            {
              maxLength: 6,
              minLength: 6,
              required: true,
            },
          ),
          createFormSubmitButton(
            (options: ForgotPasswordFunctionArgumentType) =>
              options.contextData.submitState[0]?.isLoading
                ? "Verifying..."
                : "Submit",
            async (options: ForgotPasswordFunctionArgumentType) => {
              await handleOtpSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Previous Step",
            (options: ForgotPasswordFunctionArgumentType) => {
              options.contextData.stageData[1]("name", 0);
            },
          ),
        ],
        css: SETTINGS_CONSTANTS.FORM_GRID_CSS,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
  };

  // Step 3: Enter new password
  const stepNewPasswordSchema: FieldAttribute = {
    as: "div",
    attributes: [
      ...createFormHeader("Set New Password"),
      {
        attributes: [
          // New password field
          getPasswordLabelWithHintSchema("New Password", "newPassword"),
          {
            as: "div",
            attributes: [
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "newPassword",
                props: (options: ForgotPasswordFunctionArgumentType) => ({
                  onInput: (e: Event) => {
                    if (e.target instanceof HTMLInputElement) {
                      options.updateValue(e.target.value);
                    }
                  },
                  onKeyDown: async (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      if (e.target instanceof HTMLInputElement) {
                        options.updateValue(e.target.value);
                      }
                      if (options.contextData.submitState[0]?.isLoading) {
                        return;
                      }
                      try {
                        options.contextData.submitState[1]("isLoading", true);
                        await handlePasswordResetSubmit(options);
                      } finally {
                        options.contextData.submitState[1]("isLoading", false);
                      }
                    }
                  },
                  type: showPassword.newPassword ? "text" : "password",
                }),
                validation: {
                  required: true,
                },
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Html",
                    as: "icon",
                    props: () => ({
                      icon: showPassword.newPassword
                        ? "ph:eye"
                        : "ph:eye-slash",
                      onClick: () => toggleVisibility("newPassword"),
                    }),
                  },
                ],
                css: `return \`._id {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}\`;`,
                componentName: "Html",
              },
            ],
            css: `return \`._id {
  position: relative;
}\`;`,
            componentName: "Html",
          },
          getErrorSchema("newPassword"),

          // Confirm password field
          getPasswordLabelWithHintSchema("Confirm Password", "confirmPassword"),
          {
            as: "div",
            attributes: [
              {
                css: PROPERTIES.Css.TextFieldCss,
                componentName: "SystemTextInput",
                key: "confirmPassword",
                props: (options: ForgotPasswordFunctionArgumentType) => ({
                  onInput: (e: Event) => {
                    if (e.target instanceof HTMLInputElement) {
                      options.updateValue(e.target.value);
                    }
                  },
                  onKeyDown: async (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      if (e.target instanceof HTMLInputElement) {
                        options.updateValue(e.target.value);
                      }
                      if (options.contextData.submitState[0]?.isLoading) {
                        return;
                      }
                      try {
                        options.contextData.submitState[1]("isLoading", true);
                        await handlePasswordResetSubmit(options);
                      } finally {
                        options.contextData.submitState[1]("isLoading", false);
                      }
                    }
                  },
                  type: showPassword.confirmPassword ? "text" : "password",
                }),
                validation: {
                  required: true,
                },
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Html",
                    as: "icon",
                    props: () => ({
                      icon: showPassword.confirmPassword
                        ? "ph:eye"
                        : "ph:eye-slash",
                      onClick: () => toggleVisibility("confirmPassword"),
                    }),
                  },
                ],
                css: `return \`._id {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}\`;`,
                componentName: "Html",
              },
            ],
            css: `return \`._id {
  position: relative;
}\`;`,
            componentName: "Html",
          },
          getErrorSchema("confirmPassword"),

          createFormSubmitButton(
            (options: ForgotPasswordFunctionArgumentType) =>
              options.contextData.submitState[0]?.isLoading
                ? "Resetting..."
                : "Reset Password",
            async (options: ForgotPasswordFunctionArgumentType) => {
              await handlePasswordResetSubmit(options);
            },
          ),
          createLinkButton(
            () => "Back to Previous Step",
            (options: ForgotPasswordFunctionArgumentType) => {
              options.contextData.stageData[1]("name", 1);
            },
          ),
        ],
        css: SETTINGS_CONSTANTS.FORM_GRID_CSS,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
  } as FieldAttribute;

  const form = {
    attributes: [
      {
        attributes: [
          {
            attributes: [
              {
                as: "",
                attributes: [stepUserNameSchema],
                componentName: "Html",
                props: (options: ForgotPasswordFunctionArgumentType) => ({
                  hide: options.contextData.stageData[0]?.name !== 0,
                }),
              },
              {
                as: "",
                attributes: [stepOTPSchema],
                componentName: "Html",
                props: (options: ForgotPasswordFunctionArgumentType) => ({
                  hide: options.contextData.stageData[0]?.name !== 1,
                }),
              },
              {
                as: "",
                attributes: [stepNewPasswordSchema],
                componentName: "Html",
                props: (options: ForgotPasswordFunctionArgumentType) => ({
                  hide: options.contextData.stageData[0]?.name !== 2,
                }),
              },
            ],
            componentName: "Data",
            name: "stageData",

            props: () => ({
              data: createStore({
                name: 0, // Initial stage
              }),
            }),
          },
        ],
        componentName: "Data",
        name: "submitState",

        props: () => ({
          data: createStore({
            isLoading: false,
          }),
        }),
      },
    ],
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  };

  return (
    <SchemaRenderer
      form={{
        attributes: [
          {
            ...wrapFormInCard(form),
            props: (options: FunctionArgumentType) => ({
              beforeMount: () => {
                createFocusTrap({
                  element: options.ref,
                  observeChanges: true,
                  restoreFocus: true,
                  initialFocusElement: () =>
                    document.getElementsByTagName("input")[0],
                });
              },
            }),
          },
        ],
        key: "ForgotPassword",
      }}
    />
  );
}
