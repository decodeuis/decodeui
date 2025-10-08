import { createAsync } from "@solidjs/router";
import { createEffect, Show } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import { validateEmail } from "~/lib/validation/validateEmail";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";

import { SchemaRenderer } from "../../SchemaRenderer";
import { ProfileImageSettings } from "./ProfileImageSettings";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

// Define a type for the save state
type SaveState = {
  isLoading: boolean;
  isSuccess: boolean;
};

// Define a type for function arguments with saveState in contextData
interface SaveStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: [SaveState, SetStoreFunction<SaveState>];
    [key: string]: unknown;
  };
}

export function ProfileSettings() {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();

  const isAdminSubDomain = () => getMemberVertex(graph).P.subDomain === "admin";

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["User"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  // Create notification banners
  const systemInfoBanner = {
    as: "div",
    attributes: [
      {
        as: "icon",
        icon: "ph:info-fill",
        css: `return \`._id {
color: \${args.theme.var.color.primary};
font-size: 24px;
margin-right: 12px;
}\`;`,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: `return \`._id {
color: \${args.theme.var.color.text};
font-weight: 600;
display: block;
}\`;`,
            componentName: "Html",
            text: "Important!",
          },
          {
            as: "span",
            css: `return \`._id {
margin-top: 4px;
color: \${args.theme.var.color.text};
}\`;`,
            componentName: "Html",
            text: "Changing your username or email will update them across all your projects.",
          },
        ],
        componentName: "Html",
      },
    ],
    css: `return \`._id {
padding: 16px;
background-color: \${args.theme.var.color.primary_light_150};
border-radius: 8px;
border: 1px solid \${args.theme.var.color.primary_light_200};
display: flex;
align-items: flex-start;
}\`;`,
    componentName: "Html",
  };

  const pendingEmailBanner = {
    as: "div",
    attributes: [
      {
        as: "icon",
        icon: "ph:warning-circle-fill",
        css: `return \`._id {
color: \${args.theme.var.color.warning};
font-size: 24px;
margin-right: 12px;
}\`;`,
        componentName: "Html",
      },
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: `return \`._id {
color: \${args.theme.var.color.warning};
font-weight: 600;
display: block;
}\`;`,
            componentName: "Html",
            text: "Email Change Pending",
          },
          {
            as: "span",
            css: `return \`._id {
margin-top: 4px;
color: \${args.theme.var.color.text};
display: block;
}\`;`,
            componentName: "Html",
            text: "Please check your email to confirm your new email address.",
          },
          {
            as: "span",
            css: `return \`._id {
display: block;
margin-top: 8px;
font-weight: 600;
color: \${args.theme.var.color.text};
}\`;`,
            componentName: "Html",
            props: () => ({
              text: graph.vertexes[formDataId]?.P?.pendingEmail
                ? `New email: ${graph.vertexes[formDataId]?.P?.pendingEmail}`
                : "",
            }),
          },
          {
            as: "button",
            css: `return \`._id {
display: inline-flex;
align-items: center;
margin-top: 12px;
padding: 6px 12px;
background-color: \${args.theme.var.color.warning};
color: \${args.theme.var.color.primary_text};
border-radius: 4px;
border: none;
font-size: 14px;
font-weight: 500;
cursor: pointer;
}\`;`,
            componentName: "Html",
            attributes: [
              {
                as: "icon",
                icon: "ph:envelope-simple-fill",
                css: `return \`._id {
font-size: 16px;
margin-right: 8px;
}\`;`,
                componentName: "Html",
              },
              {
                as: "span",
                componentName: "Html",
                text: "Resend Confirmation Email",
              },
            ],
            props: () => ({
              onClick: async () => {
                try {
                  const response = await postAPI(
                    API.auth.resendEmailConfirmationUrl,
                    {},
                  );
                  if (response.error) {
                    showErrorToast(response.error as string);
                  } else {
                    showSuccessToast(
                      (response.message as string) ||
                        "Confirmation email has been resent",
                    );
                  }
                } catch (error) {
                  showErrorToast((error as Error).message);
                }
              },
            }),
          },
        ],
        componentName: "Html",
      },
    ],
    css: `return \`._id {
padding: 16px;
background-color: \${args.theme.var.color.warning_light_150};
border-radius: 8px;
border: 1px solid \${args.theme.var.color.warning_light_200};
margin-bottom: 16px;
display: flex;
align-items: flex-start;
}\`;`,
    componentName: "Html",
    props: () => ({
      hide: !graph.vertexes[formDataId]?.P?.pendingEmail,
    }),
  };

  // Create form fields
  const usernameField = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.LABEL_CSS,
        componentName: "Html",
        text: "Username",
        validation: { required: true },
      },
      {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        key: "username",
        placeholder: "Username",
        validation: { required: true },
      },
    ],
    css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
    componentName: "Html",
  };

  const emailField = {
    as: "div",
    attributes: [
      {
        as: "span",
        css: SETTINGS_CONSTANTS.LABEL_CSS,
        componentName: "Html",
        key: "emailLabel",
        text: "Email Address",
      },
      {
        css: PROPERTIES.Css.TextFieldCss,
        componentName: "SystemTextInput",
        key: "email",
        placeholder: "Email Address",
        type: "email",
        validation: { required: true },
      },
    ],
    css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
    componentName: "Html",
  };

  // Create save button with icon
  const saveButton = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "button",
            componentName: "Html",
            props: (options: SaveStateFunctionArgumentType) => {
              const { saveState } = options.contextData;
              return {
                disabled: saveState[0]?.isLoading,
                onClick: async () => {
                  saveState[1]("isLoading", true);
                  saveState[1]("isSuccess", false);

                  // Form validation and submission
                  const user = graph.vertexes[formDataId];
                  if (!user.P.username?.trim()) {
                    showErrorToast("Please enter username");
                    saveState[1]("isLoading", false);
                    return;
                  }

                  if (!user.P.email?.trim()) {
                    showErrorToast("Please enter email");
                    saveState[1]("isLoading", false);
                    return;
                  }

                  if (validateEmail(user.P.email as string)) {
                    showErrorToast("Please enter a valid email");
                    saveState[1]("isLoading", false);
                    return;
                  }

                  try {
                    const payload = {
                      email: user.P.email,
                      username: user.P.username,
                      uuid: user.P.uuid,
                    };
                    const response = await postAPI(
                      API.auth.profileUrl,
                      payload,
                    );
                    if (response.error) {
                      showErrorToast(response.error as string);
                    } else {
                      showSuccessToast(
                        (response.message as string) ||
                          "Profile updated successfully",
                      );
                      saveState[1]("isSuccess", true);
                    }
                  } catch (error) {
                    showErrorToast((error as Error).message);
                  } finally {
                    saveState[1]("isLoading", false);
                  }
                },
              };
            },
            attributes: [
              {
                as: "icon",
                icon: "ph:check-circle-fill",
                css: `return \`._id {
color: \${args.theme.var.color.primary_text};
font-size: 20px;
margin-right: 8px;
}\`;`,
                componentName: "Html",
                props: (options: SaveStateFunctionArgumentType) => {
                  const { saveState } = options.contextData;
                  return {
                    hide: !saveState[0]?.isSuccess,
                  };
                },
              },
              {
                as: "span",
                componentName: "Html",
                props: (options: SaveStateFunctionArgumentType) => {
                  const { saveState } = options.contextData;
                  return {
                    text: saveState[0]?.isLoading
                      ? "Saving..."
                      : saveState[0]?.isSuccess
                        ? "Saved!"
                        : "Save Changes",
                  };
                },
              },
            ],
            css: [
              SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
              `return \`._id {
display: flex;
align-items: center;
justify-content: center;
}\`;`,
            ],
          },
        ],
        css: `return \`._id {
display: flex;
}\`;`,
        componentName: "Html",
      },
    ],
    componentName: "Html",
    contextName: "saveState",
    props: () => ({
      data: createStore<SaveState>({
        isLoading: false,
        isSuccess: false,
      }),
    }),
  };

  // Assemble the form
  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "div",
            attributes: [systemInfoBanner],
            css: `return \`._id {
margin-bottom: 24px;
}\`;`,
            componentName: "Html",
            props: () => ({
              hide: !isAdminSubDomain(),
            }),
          },
          pendingEmailBanner,
        ],
        componentName: "Html",
      },
      usernameField,
      emailField,
      saveButton,
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      onUnmount: () => {
        options.revertTransactionUpToIndex(options.txnId, -1);
      },
    }),
  } as FieldAttribute;

  // Get user data and update vertex properties
  const loadUserData = createAsync(
    async () => {
      try {
        return await getUserRPC();
      } catch (err) {
        showErrorToast((err as Error).message);
      }
    },
    { deferStream: true },
  );
  const setUserData = (user: UserData) => {
    if (user.user) {
      replaceVertexProperties(0, formDataId, graph, setGraph, user.user.P);
    }
  };
  createEffect(() => {
    const userData = loadUserData();
    if (userData) {
      setUserData(userData as UserData);
    }
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "Profile" }}
        formDataId={formDataId}
      />
      <Show when={!isAdminSubDomain()}>
        <As as="hr" css={SETTINGS_CONSTANTS.SECTION_DIVIDER_CSS} />
        <ProfileImageSettings />
      </Show>
    </div>
  );
}
