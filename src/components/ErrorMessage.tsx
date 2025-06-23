import type { JSX } from "solid-js";
import { As } from "~/components/As";
import { A } from "@solidjs/router";

export interface ErrorMessageProps {
  message: string;
  children?: JSX.Element;
  linkText?: string;
  linkUrl?: string;
}

export function ErrorMessage(props: ErrorMessageProps) {
  return (
    <As
      as="div"
      css={`return \`._id {
        background-color: \${args.theme.var.color.error_light_150};
        color: \${args.theme.var.color.error_light_150_text};
        padding: 1rem;
        border-radius: 0.25rem;
        text-align: center;
        margin-bottom: 1rem;
      }\`;`}
    >
      <div class="error-message-content">
        {props.message}
        {props.children}
      </div>
      {props.linkUrl && props.linkText && (
        <div class="error-message-action">
          <A href={props.linkUrl}>{props.linkText}</A>
        </div>
      )}
    </As>
  );
}
