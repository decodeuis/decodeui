import type { JSX } from "solid-js";
import { As } from "~/components/As";
import { API } from "~/lib/api/endpoints";

interface UnauthenticatedMenuProps {
  onClose: () => void;
}

export function UnauthenticatedMenu(
  props: Readonly<UnauthenticatedMenuProps>,
): JSX.Element {
  return (
    <>
      <As
        as="li"
        css={`return \`._id {
            margin: 5px 10px;
        }\`;`}
      >
        <As
          as="a"
          css={`return \`._id {
  display: flex;
  align-items: center;
  color: \${args.theme.var.color.text};
  padding: 5px 7px;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: \${args.theme.var.color.background_light_100};
  }
}\`;`}
          href={API.urls.admin.signIn}
          onclick={props.onClose}
          replace={true}
        >
          Log In
        </As>
      </As>
      <As
        as="li"
        css={`return \`._id {
            margin: 5px 10px;
        }\`;`}
      >
        <As
          as="a"
          css={`return \`._id {
  display: flex;
  align-items: center;
  color: \${args.theme.var.color.text};
  padding: 5px 7px;
  border-radius: 5px;
  text-decoration: none;
  &:hover {
    background-color: \${args.theme.var.color.background_light_100};
  }
}\`;`}
          href={API.urls.user.signUp}
          onclick={props.onClose}
          replace={true}
        >
          Sign Up
        </As>
      </As>
    </>
  );
}
