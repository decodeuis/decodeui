import { As } from "~/components/As";

export function ResponseContent(props: { response: string }) {
  return (
    <>
      <As
        as="div"
        css={[
          `return \`._id {
  font-weight: 600;
  margin-bottom: 8px;
  color: \${args.theme.var.color.text_light_400};
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  width: 100%;
}\`;`,
        ]}
      >
        <As
          as="span"
          css={`return \`._id {
            background: linear-gradient(45deg, \${args.theme.var.color.primary}, \${args.theme.var.color.secondary});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 18px;
          }\`;`}
        >
          🤖
        </As>
        AI Response
      </As>
      <As
        as="div"
        css={`return \`._id {
  white-space: pre-wrap;
  line-height: 1.6;
  color: \${args.theme.var.color.text_light_300};
  font-size: 14px;
  padding: 16px;
  background: \${args.theme.var.color.background_light_98};
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
  border: 1px solid \${args.theme.var.color.background_light_95};
}\`;`}
      >
        {props.response}
      </As>
    </>
  );
}
