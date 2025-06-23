import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";

import { SchemaRenderer } from "../SchemaRenderer";
import { STYLES } from "../settings/constants";
import { useFormRefs } from "./functions/useFormRefs";
import { useFormSubmit } from "./functions/useFormSubmit";
import { usePasswordVisibility } from "./functions/usePasswordVisibility";
import { validateFormData } from "./functions/validateFormData";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createPasswordField } from "~/pages/auth/functions/schema/createPasswordField";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface SignInFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function SignInForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Use our utility hooks
  const [showPassword, toggleVisibility] = usePasswordVisibility(["password"]);
  const [formRefs, setRef] = useFormRefs(["emailRef", "passwordRef"]);
  const { showErrorToast, submitForm } = useFormSubmit();

  onMount(() => {
    if (searchParams.error) {
      showErrorToast(searchParams.error as string);
      setSearchParams({ error: null }, { replace: true });
    }
  });

  // Validation function using our utility
  const validateLoginData = (formData: Vertex) => {
    return validateFormData(formData, showErrorToast, {
      allowEmailOrUsername: true,
      requireEmail: true,
      requirePassword: true,
    });
  };

  // Submit handler using our utility
  const handleSubmit = async (formData: Vertex) => {
    await submitForm(formData, {
      apiCall: (data) =>
        postAPI(API.auth.signInUrl, {
          email: data.P.email.toLowerCase(),
          password: data.P.password,
        }),
      loadMessage: "Logging In...",
      navigate,
      shouldRedirect: true,
      successMessage: "Logged In Successfully",
      validateFn: validateLoginData,
    });
  };

  // Password field enter key handler
  const handlePasswordEnter = async (
    options: SignInFormFunctionArgumentType,
  ) => {
    try {
      options.contextData.submitState[1]("isLoading", true);
      const formData = options.data;
      await handleSubmit(formData);
    } finally {
      options.contextData.submitState[1]("isLoading", false);
    }
  };

  // Email field enter key handler
  const handleEmailEnter = (options: SignInFormFunctionArgumentType) => {
    // Focus password field if empty
    if (!options.data?.P.password && formRefs.passwordRef) {
      formRefs.passwordRef.focus();
    } else {
      handlePasswordEnter(options);
    }
  };

  const form = {
    as: "div",
    attributes: [
      // Use our utility for form header
      ...createFormHeader(
        "Sign in to DecodeUI",
        "Welcome back! Please sign in to continue",
      ),
      {
        attributes: [
          {
            attributes: [
              // Use our utility for text field
              ...createTextField(
                "email",
                "Username/Email",
                handleEmailEnter,
                (ref) => setRef("emailRef", ref),
              ),
              // Use our utility for password field
              ...createPasswordField(
                "password",
                "Password",
                showPassword,
                toggleVisibility,
                handlePasswordEnter,
                (ref) => setRef("passwordRef", ref),
              ),
              {
                as: "div",
                attributes: [
                  {
                    as: "a",
                    css: `return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 14px;
  cursor: pointer;
}\`;`,
                    componentName: "Html",
                    props: () => ({
                      onClick: () => {
                        navigate(API.urls.user.forgotPassword);
                      },
                    }),
                    text: "Forgot Password?",
                  },
                ],
                css: `return \`._id {
  text-align: right;;
  margin-bottom: 16px;
}\`;`,
                componentName: "Html",
              },
              {
                as: "button",
                css: [
                  STYLES.button2Css,
                  `return \`._id {
                    width: 100%;
                  }
                  ._id:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background-color: \${args.theme.var.color.border};
                  }\`;`,
                ],
                componentName: "Html",
                props: (options: SignInFormFunctionArgumentType) => {
                  const isFormEmpty =
                    !options.data?.P?.email?.trim() ||
                    !options.data?.P?.password?.trim();
                  const isLoading =
                    options.contextData.submitState[0]?.isLoading;

                  return {
                    disabled: isLoading || isFormEmpty,
                    onClick: async () => {
                      try {
                        options.contextData.submitState[1]("isLoading", true);
                        await handleSubmit(options.data);
                      } finally {
                        options.contextData.submitState[1]("isLoading", false);
                      }
                    },
                    text: isLoading ? "Logging in..." : "Log In",
                  };
                },
                type: "button",
              },
            ],
            componentName: "Data",
            name: "submitState",

            props: () => ({
              data: createStore<{ isLoading: boolean }>({
                isLoading: false,
              }),
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "span",
                css: `return \`._id {
  color: \${args.theme.var.color.text};
}\`;`,
                componentName: "Html",
                text: "Don't have an account? ",
              },
              {
                as: "a",
                css: `return \`._id {
  color: \${args.theme.var.color.primary};
  cursor: pointer;
}\`;`,
                componentName: "Html",
                props: () => ({
                  onClick: () => {
                    navigate("/auth/signup");
                  },
                }),
                text: "Sign Up",
              },
            ],
            css: `return \`._id {
  text-align: center;
  margin-top: 16px;
  border-top: 1px solid \${args.theme.var.color.border};
  padding-top: 16px;
}\`;`,
            componentName: "Html",
          },
        ],
        componentName: "Html",
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
        key: "Login",
      }}
    />
  );
}
