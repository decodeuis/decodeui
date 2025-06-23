import { Icon } from "@iconify-icon/solid";
import { type JSX, splitProps } from "solid-js";
import { As } from "~/components/As";

export function SearchBar(
  props: Readonly<
    JSX.InputHTMLAttributes<HTMLInputElement> & {
      handleChange: (value: string) => void;
    }
  >,
) {
  const [_local, inputProps] = splitProps(props, ["handleChange"]);
  return (
    <As
      as="div"
      css={`return \`._id {
  /* lh: 28px; */
  display: flex;
  align-items: center;
  padding: 5px 0px;
  position: relative;
  width: 100%;
}\`;`}
    >
      <As
        as={Icon}
        css={`return \`._id {
  color: \${args.theme.var.color.text_light_200};
  padding-left: 6px;
  position: absolute;
}\`;`}
        height={18}
        icon="ph:magnifying-glass"
        noobserver
        width={18}
      />
      <As
        as="input"
        css={`return \`._id {
  line-height: 28px;
  border: 1px solid \${args.theme.var.color.border};
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.text};
  font-size: 14px;
  height: 40px;
  padding: 0 1rem 0 1.8rem;
  border-radius: 8px;
  transition: 0.3s ease;
  width: 100%;
  &:focus {
    outline: none;
    border-color: \${args.theme.var.color.primary};
    background-color: \${args.theme.var.color.background_light_100};
  }
  &::placeholder {
    color: \${args.theme.var.color.text_light_400};
  }
}\`;`}
        onInput={(e) => props.handleChange(e.target.value)}
        type="search"
        value={props.value}
        {...inputProps}
      />
    </As>
  );
}
