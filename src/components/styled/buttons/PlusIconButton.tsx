import { IconButton } from "~/components/styled/IconButton";

interface PlusIconButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  size?: string;
}

export function PlusIconButton(props: PlusIconButtonProps) {
  return (
    <IconButton
      css={`return \`._id {
        background-color: \${args.theme.var.color.primary_light_850};
        color: \${args.theme.var.color.primary};
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: \${args.theme.var.color.primary_light_500};
          color: \${args.theme.var.color.primary_light_500_text};
        }
      }\`;`}
      icon="ph:plus"
      size={props.size || "18"}
      aria-label={props.ariaLabel || "Add new item"}
      onClick={props.onClick}
    />
  );
}
