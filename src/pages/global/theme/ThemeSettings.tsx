import { SelectThemeMenu } from "~/pages/theme_menu/SelectThemeMenu";
import { As } from "~/components/As";

export function ThemeSettings() {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}\`;`}
      >
        <As
          as="h2"
          css={`return \`._id {
  white-space: 1.2rem;
  font-size: medium;
}\`;`}
        >
          Theme Management
        </As>
        <As
          as="p"
          css={`return \`._id {
  color: \${args.theme.var.color.text_light_400};
}\`;`}
        >
          Customize the look and feel of your application by managing themes.
        </As>
      </As>
      <As
        as="div"
        css={`return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.background_light_100_text};
  border-radius: 6px;
  padding: 1rem;
}\`;`}
      >
        <SelectThemeMenu isStandalone={true} />
      </As>
    </As>
  );
}
