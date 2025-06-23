import type { JSX } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { As } from "../As";

export type AlertType = "error" | "warning" | "info" | "success";

interface SimpleAlertProps {
  type?: AlertType;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  linkHoverColor?: string;
  linkHref?: string;
  linkText?: string;
  message?: string;
  padding?: string;
}

const alertConfig = {
  error: {
    icon: "mdi:alert-circle",
    defaultBg: "error_light_50",
    defaultBorder: "error",
    defaultIcon: "error",
    defaultLink: "error",
    defaultLinkHover: "error_light_200",
  },
  warning: {
    icon: "mdi:alert",
    defaultBg: "warning_light_50",
    defaultBorder: "warning",
    defaultIcon: "warning",
    defaultLink: "warning",
    defaultLinkHover: "warning_light_200",
  },
  info: {
    icon: "mdi:information",
    defaultBg: "primary_light_50",
    defaultBorder: "primary",
    defaultIcon: "primary",
    defaultLink: "primary",
    defaultLinkHover: "primary_light_200",
  },
  success: {
    icon: "mdi:check-circle",
    defaultBg: "success_light_50",
    defaultBorder: "success",
    defaultIcon: "success",
    defaultLink: "success",
    defaultLinkHover: "success_light_200",
  },
};

export function SimpleAlert(props: Readonly<SimpleAlertProps>): JSX.Element {
  const type = () => props.type || "info";
  const config = () => alertConfig[type()];

  return (
    <As
      as="div"
      css={[
        `return \`._id {
          border-left-width: 4px;
        }\`;`,
        props.backgroundColor
          ? `return \`._id { background-color: ${props.backgroundColor}; }\`;`
          : `return \`._id { background-color: \${args.theme.var.color.${config().defaultBg}}; color: \${args.theme.var.color.${config().defaultBg}_text}; }\`;`,
        props.borderColor
          ? `return \`._id { border-color: ${props.borderColor}; }\`;`
          : `return \`._id { border-color: \${args.theme.var.color.${config().defaultBorder}}; }\`;`,
        props.padding
          ? `return \`._id { padding: ${props.padding}; }\`;`
          : `return \`._id { padding: 1rem; }\`;`,
      ]}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
}\`;`}
      >
        <As
          as="div"
          css={`return \`._id {
  flex-shrink: 0;
}\`;`}
        >
          <Icon
            icon={config().icon}
            css={[
              `return \`._id {
                height: 1.25rem;
                width: 1.25rem;
                display: inline-block;
              }\`;`,
              props.iconColor
                ? `return \`._id { color: ${props.iconColor}; }\`;`
                : `return \`._id { color: \${args.theme.var.color.${config().defaultIcon}}; }\`;`,
            ]}
          />
        </As>
        <As
          as="div"
          css={`return \`._id {
  margin-left: 0.75rem;
}\`;`}
        >
          <As
            as="p"
            css={`return \`._id {
  line-height: 1.25rem;
  font-size: 0.875rem;
  color: \${args.theme.var.color.text};
  font-weight: 500;
}\`;`}
          >
            {props.message || type().charAt(0).toUpperCase() + type().slice(1)}
            {props.linkText && (
              <>
                {" "}
                <As
                  as="a"
                  css={[
                    `return \`._id {
                      color: \${args.theme.var.color.${config().defaultLink}};
                      font-weight: 600;
                      text-decoration: underline;
                    }\`;`,
                    props.linkHoverColor
                      ? `return \`._id:hover { color: ${props.linkHoverColor}; }\`;`
                      : `return \`._id:hover { color: \${args.theme.var.color.${config().defaultLinkHover}}; }\`;`,
                  ]}
                  href={props.linkHref || "#"}
                >
                  {props.linkText}
                </As>
              </>
            )}
          </As>
        </As>
      </As>
    </As>
  );
}
