import { type Component, createMemo } from "solid-js";
import { As } from "~/components/As";

// A flexible loader component that displays a spinner and optional message
export const Loader: Component<{
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}> = (props) => {
  const getSize = createMemo(() => {
    switch (props.size) {
      case "small":
        return { spinner: 24, fontSize: 14 };
      case "large":
        return { spinner: 56, fontSize: 18 };
      default:
        return { spinner: 40, fontSize: 16 };
    }
  });

  return (
    <As
      as="div"
      css={[
        `return \`._id {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }\`;`,
        props.fullScreen
          ? `return \`._id {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: \${args.theme.var.color.background_light_100};
          z-index: 9999;
        }\`;`
          : "",
      ]}
    >
      <As
        as="div"
        css={[
          `return \`._id {
            display: inline-block;
            width: ${getSize().spinner}px;
            height: ${getSize().spinner}px;
            border: 3px solid \${args.theme.var.color.border};
            border-radius: 50%;
            border-top-color: \${args.theme.var.color.primary};
            animation: spinner 1s ease-in-out infinite;
          }\`;`,
          `return \`@keyframes spinner {
            to {transform: rotate(360deg);}
          }\`;`,
        ]}
      />
      {props.message && (
        <As
          as="p"
          css={`return \`._id {
            color: \${args.theme.var.color.text};
            font-size: ${getSize().fontSize}px;
            margin: 0;
            text-align: center;
          }\`;`}
        >
          {props.message}
        </As>
      )}
    </As>
  );
};
