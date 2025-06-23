import { createSignal, type JSX, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { getProfileImageUrl } from "~/lib/graph/get/sync/user/getProfileImageUrl";
import { IconButton } from "~/components/styled/IconButton";

import { MenuItems } from "./MenuItems";
import { ProfileHeader } from "./ProfileHeader";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { useThemeToggle } from "~/lib/hooks/useThemeToggle";

export function UserDropdownMenuDisplay(): JSX.Element {
  const [graph] = useGraph();
  const [isOpen, setIsOpen] = createSignal(false);
  const { toggleTheme, currentMode } = useThemeToggle();
  let btnEl: HTMLButtonElement;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <As
        as="div"
        css={`return \`._id {display: flex; align-items: center; gap: 8px;}\`;`}
      >
        <IconButton
          icon={currentMode() === "dark" ? "ph:sun-fill" : "ph:moon-fill"}
          title={`Switch to ${currentMode() === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
          css={`return \`._id {
            height: 36px;
            width: 36px;
            padding: 6px;
            border-radius: 7px;
            background-color: \${args.theme.var.color.background_light_100};
            border: none;
            cursor: pointer;
            color: \${args.theme.var.color.text};
            
            &:hover {
              background-color: \${args.theme.var.color.background_light_200};
            }
            
            svg {
              fill: currentColor;
            }
          }\`;`}
        />
        <As
          as="button"
          css={`return \`._id {
            display: flex;
            align-items: center;
            height: 36px;
            padding: 6px;
            border-radius: 7px;
            width: 36px;
            background-size: cover;
            border: none;
            cursor: pointer;
            background-color: \${args.theme.var.color.background_light_100};
            background-image: url(${getProfileImageUrl(graph)});

            &:hover {
              background-color: \${args.theme.var.color.background_light_200};
            }
          }\`;`}
          id="user-dropdown-toggle"
          onClick={handleOpen}
          ref={btnEl!}
        />
      </As>
      <Show when={isOpen()}>
        <ZIndex>
          <DropdownMenu
            css={`return \`._id {
  border-radius: 5px;
}\`;`}
            onClickOutside={handleClose}
            parentRef={btnEl!}
            placement="bottom-end"
          >
            <As
              as="ul"
              css={`return \`._id {
  list-style-type: none;
  margin: 0;
  padding: 0;
  position: relative;
}\`;`}
            >
              <ProfileHeader />
              <As
                as="hr"
                css={`return \`._id {
  color: \${args.theme.var.color.text};
}\`;`}
              />
              <MenuItems onClose={handleClose} />
            </As>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
