import { useNavigate } from "@solidjs/router";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { postAPI } from "~/lib/api/general/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { getPasswordLabelWithHintSchema } from "~/lib/schema/passwordHintPopover";
import { validatePassword } from "~/lib/validation/validatePassword";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { useGraph } from "~/lib/graph/context/UseGraph";

type SaveState = {
  isLoading: boolean;
};

// Define a type for function arguments with saveState in contextData
interface SaveStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: [SaveState, SetStoreFunction<SaveState>];
    [key: string]: unknown;
  };
}

export function PasswordChangeForm() {
  const [graph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });

  const form = {
    as: "div",
    attributes: [
      createPasswordFieldWithHint(
        "Current Password",
        "currentPassword",
        showPassword,
        setShowPassword,
      ),
      createPasswordFieldWithHint(
        "New Password",
        "newPassword",
        showPassword,
        setShowPassword,
      ),
      createPasswordFieldWithHint(
        "Confirm New Password",
        "confirmPassword",
        showPassword,
        setShowPassword,
        "Confirm New Password",
      ),
      {
        as: "div",
        attributes: [
          {
            attributes: [
              {
                as: "button",
                css: `return \`._id {
  background-color: \${args.theme.var.color.primary};
  color: \${args.theme.var.color.primary_text};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  margin-right: 8px;
}\`;`,
                componentName: "Html",
                props: (options: SaveStateFunctionArgumentType) => ({
                  disabled: options.contextData.saveState[0]?.isLoading,
                  onClick: async () => {
                    const formData = options.data;
                    if (validateFormData(formData, showErrorToast)) {
                      try {
                        options.contextData.saveState[1]("isLoading", true);
                        await handlePasswordChange(
                          formData,
                          graph,
                          showErrorToast,
                          showSuccessToast,
                        );
                        // Redirect to signIn page as session is expired
                        navigate(API.urls.admin.signIn);
                      } finally {
                        options.contextData.saveState[1]("isLoading", false);
                      }
                    }
                  },
                  text: options.contextData.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Change Password",
                }),
              },
            ],
            componentName: "Data",
            name: "saveState",

            props: () => ({
              data: createStore<SaveState>({
                isLoading: false,
              }),
            }),
          },
        ],
        css: `return \`._id {
  margin-top: 24px;
}\`;`,
        componentName: "Html",
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  } as FieldAttribute;

  return (
    <SchemaRenderer form={{ attributes: [form], key: "PasswordChange" }} />
  );
}

function createPasswordFieldWithHint(
  label: string,
  key: string,
  showPassword: Store<{ [key: string]: boolean }>,
  setShowPassword: SetStoreFunction<{ [key: string]: boolean }>,
  placeholder?: string,
) {
  return {
    as: "div",
    attributes: [
      getPasswordLabelWithHintSchema(label, key),
      {
        as: "div",
        attributes: [
          {
            css: PROPERTIES.Css.TextFieldCss,
            componentName: "SystemTextInput",
            key,
            placeholder: placeholder || `Enter ${label.toLowerCase()}`,
            props: (options: FunctionArgumentType) => ({
              onInput: (e: Event) => {
                if (e.target instanceof HTMLInputElement) {
                  options.updateValue(e.target.value);
                }
              },
              type: showPassword[key] ? "text" : "password",
            }),
            validation: { required: true },
          },
          {
            as: "div",
            attributes: [
              {
                componentName: "Html",
                as: "icon",
                props: () => ({
                  icon: showPassword[key] ? "ph:eye" : "ph:eye-slash",
                  onClick: () => setShowPassword(key, !showPassword[key]),
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
    ],
    css: SETTINGS_CONSTANTS.GRID_ITEM_CSS,
    componentName: "Html",
  };
}

async function handlePasswordChange(
  formData: Vertex,
  graph: GraphInterface,
  showErrorToast: (msg: string) => void,
  showSuccessToast: (msg: string) => void,
) {
  try {
    const response = await postAPI(API.auth.changePasswordUrl, {
      currentPassword: formData.P.currentPassword,
      newPassword: formData.P.newPassword,
      uuid: getMemberVertex(graph)?.P.uuid,
    });

    if (response.error) {
      showErrorToast(response.error as string);
    } else {
      showSuccessToast("Password changed successfully");
    }
  } catch (error) {
    showErrorToast(getErrorMessage(error));
  }
}

function validateFormData(
  formData: Vertex,
  showErrorToast: (msg: string) => void,
) {
  const { confirmPassword, currentPassword, newPassword } = formData.P;

  if (!currentPassword?.trim()) {
    showErrorToast("Please enter current password");
    return false;
  }
  if (!newPassword?.trim()) {
    showErrorToast("Please enter new password");
    return false;
  }
  if (!confirmPassword?.trim()) {
    showErrorToast("Please enter confirm password");
    return false;
  }

  const currentPasswordError = validatePassword(currentPassword);
  if (currentPasswordError) {
    showErrorToast(`Current ${currentPasswordError}`);
    return false;
  }
  const newPasswordError = validatePassword(newPassword);
  if (newPasswordError) {
    showErrorToast(`New ${newPasswordError}`);
    return false;
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    showErrorToast("New and confirm passwords don't match");
    return false;
  }
  if (currentPassword.trim() === newPassword.trim()) {
    showErrorToast("New password can't be the same as current password");
    return false;
  }

  return true;
}
