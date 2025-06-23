import type { JSX } from "solid-js";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

interface WithDescriptionProps {
  backgroundColor?: string;
  borderColor?: string;
  css?: string;
  description?: JSX.Element | string;
  descriptionColor?: string;
  paddingX?: string;
  paddingXSm?: string;
  paddingY?: string;
  title?: string;
  titleColor?: string;
}

export function HeaderWithDescription(
  props: Readonly<WithDescriptionProps>,
): JSX.Element {
  return (
    <As
      as="div"
      css={[
        ...ensureArray(props.css),
        `return \`._id {
          border-bottom-width: 1px;
        }\`;`,
        props.backgroundColor
          ? `return \`._id { background-color: ${props.backgroundColor}; }\`;`
          : `return \`._id { background-color: \${args.theme.var.color.background_light_50}; }\`;`,
        props.borderColor
          ? `return \`._id { border-color: ${props.borderColor}; }\`;`
          : `return \`._id { border-color: \${args.theme.var.color.border}; }\`;`,
        `return \`._id { padding: ${props.paddingY || "1.25rem"} ${props.paddingX || "1rem"}; }\`;`,
        `return \`@media (min-width: 640px) { ._id { padding: ${props.paddingY || "1.25rem"} ${props.paddingXSm || "1.5rem"}; } }\`;`,
      ]}
    >
      <As
        as="h3"
        css={[
          `return \`._id {
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
          }\`;`,
          props.titleColor
            ? `return \`._id { color: ${props.titleColor}; }\`;`
            : `return \`._id { color: \${args.theme.var.color.text}; }\`;`,
        ]}
      >
        {props.title || ""}
      </As>
      <As
        as="p"
        css={[
          `return \`._id {
            font-size: 0.875rem;
            line-height: 1.25rem;
            margin-top: 0.25rem;
          }\`;`,
          props.descriptionColor
            ? `return \`._id { color: ${props.descriptionColor}; }\`;`
            : `return \`._id { color: \${args.theme.var.color.text_light_200}; }\`;`,
        ]}
      >
        {props.description || ""}
      </As>
    </As>
  );
}
