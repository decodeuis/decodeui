import { As } from "../As";

export function LoaderNew(
  props: Readonly<{ class?: string; loaderHeight?: string }>,
) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: grid;
  height: ${props.loaderHeight ?? "100vh"};
  place-content: center;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  ${props.class ?? ""}
}\`;`}
      >
        Loading
      </As>
    </As>
  );
}
