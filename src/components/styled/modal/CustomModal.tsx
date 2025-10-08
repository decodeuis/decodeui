import {
  type Accessor,
  createSignal,
  type JSX,
  type Setter,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import { createClickOutside } from "~/lib/hooks/createClickOutside";
import { SETTINGS_CONSTANTS, STYLES } from "~/pages/settings/constants";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface CustomModalProps {
  bodyCss?: string | string[];
  children: JSX.Element;
  closeButton?: boolean;
  containerCss?: string | string[];
  customTitle?: JSX.Element;
  dialogCss?: string | string[];
  footer?: (setOpen: Setter<boolean>) => JSX.Element;
  isCloseOnOutsideClick?: boolean;
  open?: Accessor<boolean>;
  setOpen?: (open: boolean) => void;
  title?: JSX.Element | string;
}

export function CustomModal(props: Readonly<CustomModalProps>) {
  const [open, setOpen] =
    props.open && props.setOpen
      ? ([props.open, props.setOpen] as [Accessor<boolean>, Setter<boolean>])
      : createSignal(false);

  const Content = () => {
    const [floating, setFloating] = createSignal<HTMLElement | undefined>();

    const [graph, setGraph] = useGraph();
    if (props.isCloseOnOutsideClick ?? true) {
      createClickOutside(graph, setGraph, (event) => {
        const path = event.composedPath();
        if (!path.includes(floating()!)) {
          setOpen(false);
        }
      });
    }

    const Header = () => {
      return (
        <As as="div" css={SETTINGS_CONSTANTS.MODAL.HEADER.CSS}>
          <Show fallback={props.customTitle} when={!props.customTitle}>
            {props.title}
          </Show>
          <Show when={props.closeButton !== false}>
            <As
              as="button"
              css={`return \`._id {
  float: right;
  padding: 0 5px;
  border-radius: 5px;
  background-color: transparent;
  border: none;
  color: \${args.theme.var.color.text};
  cursor: pointer;
  &:hover {
    background-color: \${args.theme.var.color.background_light_200};
  }
}\`;`}
              onClick={() => setOpen(false)}
              title="Close"
              type="button"
            >
              ✕
            </As>
          </Show>
        </As>
      );
    };
    return (
      <As
        as="div"
        aria-modal="true"
        css={[
          SETTINGS_CONSTANTS.MODAL.BODY.CSS,
          ...ensureArray(props.dialogCss),
          `return \`._id {border-radius: 10px;}\`;`,
        ]}
        ref={setFloating}
        role="dialog"
      >
        <Header />
        <As
          as="hr"
          css={`return \`._id {
  color: \${args.theme.var.color.background_light_300};
}\`;`}
        />
        <As
          as="div"
          css={[
            ...ensureArray(props.bodyCss),
            STYLES.overflowCss,
            `return \`._id {
  padding: 3px;
}\`;`,
          ]}
        >
          {props.children}
        </As>
        {props.footer?.(setOpen)}
      </As>
    );
  };

  return (
    <Show when={open()}>
      <As as="div" css={SETTINGS_CONSTANTS.MODAL.OVERLAY_CSS} />
      <Portal>
        <As
          as="div"
          css={[
            SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS,
            ...ensureArray(props.containerCss),
          ]}
        >
          <Content />
        </As>
      </Portal>
    </Show>
  );
}
