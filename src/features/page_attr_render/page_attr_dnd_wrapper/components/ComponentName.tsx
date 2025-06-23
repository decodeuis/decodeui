import { As } from "~/components/As";

export function ComponentName(props: { componentName: string }) {
  return (
    <As
      as="div"
      css={`return \`._id {
  font-size: 0.875rem;
  margin-right: 4px;
}\`;`}
      title="Name"
    >
      {props.componentName}
    </As>
  );
}
