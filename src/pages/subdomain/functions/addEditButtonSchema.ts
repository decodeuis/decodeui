import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import type { ModalStateStore } from "~/lib/types/ModalStateStore";

import { SETTINGS_CONSTANTS } from "../../settings/constants";

export function addEditButtonSchema(label: string) {
  return {
    as: "",
    attributes: [
      {
        attributes: [
          {
            as: "button",
            css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                const modalState = options.contextData
                  .modalState as ModalStateStore;
                modalState[1]("showModal", true);
              },
              text: `Add New ${label}`,
            }),
            type: "button",
          },
        ],
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          show: options.data?.id?.startsWith("-"),
        }),
      },
      {
        attributes: [
          {
            as: "button",
            attributes: [
              {
                componentName: "Html",
                as: "icon",
                height: 20,
                icon: "ph:pencil",
                width: 20,
              },
            ],
            css: `return \`._id {
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: \${args.theme.var.color.primary};
  &:hover {
    background-color: \${args.theme.var.color.background_light_100};
    color: \${args.theme.var.color.primary_dark_400};
  }
}\`;`,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                const modalState = options.contextData
                  .modalState as ModalStateStore;
                modalState[1]("showModal", true);
              },
            }),
            type: "button",
          },
        ],
        componentName: "Html",
        props: (options: FunctionArgumentType) => ({
          show: !options.data?.id?.startsWith("-"),
        }),
      },
    ],
    componentName: "Html",
  } as FieldAttribute;
}
