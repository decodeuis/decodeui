import { As } from "~/components/As";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";

export interface TabButtonProps {
  data: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TabButton(props: TabButtonProps) {
  return (
    <As
      as="li"
      css={`return \`._id {
  cursor: pointer;
}\`;`}
    >
      <As
        as="button"
        css={[
          `return \`._id {
  border: none;
  display: inline-block;
  padding: 10px;
  white-space: nowrap;
  background: transparent;
  outline: none;
  color: \${args.theme.var.color.text_light_300};
  cursor: pointer;
}\`;`,
          props.isSelected
            ? `return \`._id {
              font-weight: 600;
              color: \${args.theme.var.color.primary};
              border-bottom: 2.5px solid \${args.theme.var.color.primary};
            }\`;`
            : `return \`._id {
              &:hover {
                color: \${args.theme.var.color.text};
                border-bottom: 2.5px solid \${args.theme.var.color.primary_light_400};
              }
            }\`;`,
        ]}
        onClick={props.onClick}
        type="button"
      >
        {capitalizeFirstLetter(props.data)}
      </As>
    </As>
  );
}
