import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import createFocusTrap from "solid-focus-trap";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { wrapFormInCard } from "~/lib/schema/wrapFormInCard";
import { validateEmail } from "~/lib/validation/validateEmail";

import { SchemaRenderer } from "../SchemaRenderer";
import { useFormSubmit } from "./functions/useFormSubmit";
import { createFormHeader } from "~/pages/auth/functions/schema/createFormHeader";
import { createFormSubmitButton } from "~/pages/auth/functions/schema/createFormSubmitButton";
import { createLinkButton } from "~/pages/auth/functions/schema/createLinkButton";
import { createTextAreaField } from "~/pages/auth/functions/schema/createTextAreaField";
import { createTextField } from "~/pages/auth/functions/schema/createTextField";
import type { Vertex } from "~/lib/graph/type/vertex";

// Define type for submitState store
type SubmitStateStore = ReturnType<
  typeof createStore<{
    isLoading: boolean;
  }>
>;

// Define a type for function arguments with submitState in contextData
interface ContactFormFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    submitState: SubmitStateStore;
    [key: string]: unknown;
  };
}

export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast } = useToast();
  const { submitForm } = useFormSubmit();

  // Validation function
  const validateContactForm = (formData: Vertex) => {
    const { email, message, name, subject } = formData.P;

    if (!name?.trim()) {
      showErrorToast("Please enter your name");
      return false;
    }
    if (name.trim().length < 2) {
      showErrorToast("Name must be at least 2 characters long");
      return false;
    }
    if (!/^[a-zA-Z\s-]{2,100}$/.test(name.trim())) {
      showErrorToast("Name can only contain letters, spaces, and hyphens");
      return false;
    }

    if (!email?.trim()) {
      showErrorToast("Please enter your email address");
      return false;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      showErrorToast(emailError);
      return false;
    }

    if (!subject?.trim()) {
      showErrorToast("Please enter a subject");
      return false;
    }
    if (subject.trim().length < 3) {
      showErrorToast("Subject must be at least 3 characters long");
      return false;
    }
    if (subject.trim().length > 200) {
      showErrorToast("Subject must be less than 200 characters");
      return false;
    }

    if (!message?.trim()) {
      showErrorToast("Please enter your message");
      return false;
    }
    if (message.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters long");
      return false;
    }
    if (message.trim().length > 5000) {
      showErrorToast("Message must be less than 5000 characters");
      return false;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async (formData: Vertex) => {
    await submitForm(formData, {
      apiCall: (data) =>
        postAPI(API.support.createTicketUrl, {
          email: data.P.email,
          message: data.P.message,
          name: data.P.name,
          subject: data.P.subject,
        }),
      loadMessage: "Sending message...",
      onSuccess: () => {
        navigate(API.urls.admin.signIn);
      },
      successMessage: "Support ticket created successfully",
      validateFn: validateContactForm,
    });
  };

  // Form fields
  const form = {
    attributes: [
      {
        attributes: [
          ...createFormHeader("Contact Us"),
          // Name field
          ...createTextField("name", "Full Name", undefined, undefined, {
            maxLength: 100,
            minLength: 2,
            regex: {
              enabled: true,
              message: "Name can only contain letters, spaces, and hyphens",
              value: "^[a-zA-Z\\s-]{2,100}$",
            },
            required: true,
          }),

          // Email field
          ...createTextField("email", "Email Address", undefined, undefined, {
            email: true,
            required: true,
          }),

          // Subject field
          ...createTextField("subject", "Subject", undefined, undefined, {
            maxLength: 200,
            minLength: 3,
            required: true,
          }),

          // Message field
          ...createTextAreaField("message", "Message", 6, {
            maxLength: 5000,
            minLength: 10,
            required: true,
          }),

          // Submit button
          createFormSubmitButton(
            (options: ContactFormFunctionArgumentType) =>
              options.contextData.submitState[0]?.isLoading
                ? "Sending..."
                : "Send Message",
            async (options: ContactFormFunctionArgumentType) => {
              await handleSubmit(options.data);
            },
          ),

          // Back to signIn link
          createLinkButton(
            () => "Back to Sign In",
            () => {
              navigate(API.urls.admin.signIn);
            },
          ),
        ],
        componentName: "Data",
        name: "submitState",
        props: () => ({
          data: createStore<{ isLoading: boolean }>({
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
        key: "ContactForm",
      }}
    />
  );
}
