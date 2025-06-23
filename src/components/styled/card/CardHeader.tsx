import { type JSX, Show } from "solid-js";
import { As } from "~/components/As";

export function CardHeader(props: {
  children?: JSX.Element;
  imgSrc?: string;
  title?: string;
}) {
  return (
    <>
      <Show when={props.imgSrc}>
        <As
          as="img"
          alt={props.title}
          css={`return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: \${args.theme.var.color.primary_light_750};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  height: 3rem;
  object-fit: cover;
  width: 3rem;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
}\`;`}
          src={props.imgSrc}
        />
      </Show>
      <As
        as="div"
        css={`return \`._id {
  color: \${args.theme.var.color.text_light_150};
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}\`;`}
      >
        {props.title}
      </As>
      {props.children}
    </>
  );
}
