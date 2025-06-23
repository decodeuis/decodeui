import type { JSX } from "solid-js";
import { A } from "@solidjs/router";

export interface SimpleErrorMessageProps {
  message: string;
  children?: JSX.Element;
  linkText?: string;
  linkUrl?: string;
}

// Simple Error Message that doesn't depend on the theme
export function SimpleErrorMessage(props: SimpleErrorMessageProps) {
  return (
    <div
      style={{
        "background-color": "#fee",
        color: "#c00",
        padding: "1rem",
        "border-radius": "0.25rem",
        "text-align": "center",
        "margin-bottom": "1rem",
        "font-family": "system-ui, -apple-system, sans-serif",
      }}
    >
      <div class="error-message-content">
        {props.message}
        {props.children}
      </div>
      {props.linkUrl && props.linkText && (
        <div class="error-message-action" style={{ "margin-top": "1rem" }}>
          <A
            href={props.linkUrl}
            style={{
              color: "#0066cc",
              "text-decoration": "underline",
            }}
          >
            {props.linkText}
          </A>
        </div>
      )}
    </div>
  );
}
