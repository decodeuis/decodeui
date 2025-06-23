import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { useToast } from "~/components/styled/modal/Toast";
import { getMemberVertex } from "~/lib/graph/get/sync/store/getMemberVertex";
import type { FunctionArgumentType } from "../form/type/FieldSchemaType";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function EmailConfirmationBanner() {
  const [graph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  const member = () => getMemberVertex(graph);
  //   const emailConfirmed = () => member()?.P?.emailConfirmed;

  // Create email confirmation banner schema
  const emailConfirmationBanner: FieldAttribute = {
    as: "div",
    attributes: [
      {
        as: "icon",
        icon: "ph:warning-circle-fill",
        css: (args: FunctionArgumentType) => `return \`._id {
color: ${args.theme.var.color.warning_dark_500};
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
            css: (args: FunctionArgumentType) => `return \`._id {
font-weight: 600;
display: block;
}\`;`,
            componentName: "Html",
            text: "Email Confirmation Required",
          },
          {
            as: "span",
            css: (args: FunctionArgumentType) => `return \`._id {
margin-top: 4px;
display: block;
}\`;`,
            componentName: "Html",
            text: "Please confirm your email address to access all features.",
          },
          {
            as: "button",
            css: (args: FunctionArgumentType) => `return \`._id {
display: inline-flex;
align-items: center;
margin-top: 12px;
padding: 6px 12px;
background-color: ${args.theme.var.color.warning};
color: ${args.theme.var.color.warning_text};
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
    css: (args: FunctionArgumentType) => `return \`._id {
margin: 16px;
padding: 16px;
background-color: ${args.theme.var.color.warning_light_150};
color: ${args.theme.var.color.warning_light_150_text};
border-radius: 8px;
border: 1px solid ${args.theme.var.color.warning_light_200};
display: flex;
align-items: flex-start;
}\`;`,
    componentName: "Html",
    props: (options: FunctionArgumentType) => ({
      hide: options.data.P.emailConfirmed,
    }),
  };

  // Create the form schema
  const emailConfirmationSchema: IFormMetaData = {
    attributes: [emailConfirmationBanner],
    key: "EmailConfirmationBanner",
  };

  return (
    <SchemaRenderer form={emailConfirmationSchema} formDataId={member()?.id} />
  );
}
