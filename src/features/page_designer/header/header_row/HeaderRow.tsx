import type { JSX } from "solid-js";

import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SelectThemeButton } from "~/pages/theme_menu/SelectThemeButton";

import { HomeIconButton } from "../../../../components/styled/buttons/HomeIconButton";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";

interface HeaderProps {
  children?: JSX.Element;
  css?: CssType;
  style?: JSX.CSSProperties;
}

const RightSection = () => {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
}\`;`}
    >
      <ToggleButtons />
      <SaveAllButton />
      <SelectThemeButton />
      <UserDropdownMenuDisplay />
    </As>
  );
};

export function Header(props: HeaderProps) {
  return (
    <As
      as="header"
      css={[SETTINGS_CONSTANTS.HEADER_MENU_CSS, ...ensureArray(props.css)]}
      style={props.style}
    >
      {props.children}
    </As>
  );
}

export function HeaderRow(props: HeaderProps) {
  return (
    <Header css={props.css} style={props.style}>
      <HomeIconButton />
      <RightSection />
    </Header>
  );
}
