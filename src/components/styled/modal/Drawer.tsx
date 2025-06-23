import { makeEventListener } from "@solid-primitives/event-listener";
import {
  type Accessor,
  createSignal,
  type JSX,
  type Setter,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { createClickOutside } from "~/lib/hooks/createClickOutside";
import { STYLES } from "~/pages/settings/constants";

import { useZIndex } from "../../fields/ZIndex";
import { As } from "~/components/As";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface DrawerProps {
  children: JSX.Element;
  customButton?: (
    props: Readonly<{
      isOpen: boolean;
      onClick: () => void;
    }>,
  ) => JSX.Element;
  drawerClass?: string;
  open?: Accessor<boolean>;
  setIsOpen?: Setter<boolean>;
  width?: string;
}

export function Drawer(props: Readonly<DrawerProps>) {
  const [graph, setGraph] = useGraph();
  const zIndex = useZIndex();
  const [isOpen, setIsOpen] =
    props.open && props.setIsOpen
      ? [props.open, props.setIsOpen]
      : createSignal(false);

  const [drawerWidth, setDrawerWidth] = createSignal(props.width || "450px");
  const [mainDivHover, setMainDivHover] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    const path = event.composedPath();
    if (!path.includes(floating()!)) {
      setIsOpen(false);
    }
  };

  const activeClickOutside = createClickOutside(
    graph,
    setGraph,
    handleClickOutside,
  );

  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };

  const handleEscClose = (event: KeyboardEvent) => {
    if (
      activeClickOutside !==
      getGlobalStore(graph).P.activeClickOutside[
        getGlobalStore(graph).P.activeClickOutside.length - 1
      ]
    ) {
      return;
    }
    if (event.key === "Escape" && isOpen()) {
      toggleDrawer();
    }
  };

  makeEventListener(document, "keydown", handleEscClose);

  const Resizer = () => {
    let initialX: number;
    let initialWidth: number;
    const handleMouseDown = (event: MouseEvent) => {
      initialX = event.clientX;
      initialWidth = Number.parseInt(drawerWidth(), 10);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const newWidth = initialWidth - (event.clientX - initialX);
      setDrawerWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    return (
      <As
        as="div"
        css={`return \`._id {
  cursor: ew-resize;
  height: 100%;
  left: -5px;
  position: absolute;
  top: 0px;
  width: 10px;
}\`;`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setMainDivHover(true)}
        onMouseLeave={() => setMainDivHover(false)}
      />
    );
  };

  const ResizerBorder = (p: { children: JSX.Element }) => {
    return (
      <As
        as="div"
        css={[
          `return \`._id {
            background-color: \${args.theme.var.color.background_light_100};
            color: \${args.theme.var.color.background_light_100_text};
            border-radius: 15px 0 0 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            height: 100%;
            position: fixed;
            top: 0;
            transition: right 0.5s;
            width: ${drawerWidth()};
            z-index: ${zIndex};
          }\`;`,
          isOpen()
            ? `return \`._id { right: 0; }\`;`
            : `return \`._id { right: -${drawerWidth()}; }\`;`,
          mainDivHover()
            ? `return \`._id { border-left: 2px solid \${args.theme.var.color.primary}; }\`;`
            : `return \`._id { border-left: none; }\`;`,
        ]}
        ref={setFloating}
      >
        {p.children}
      </As>
    );
  };
  return (
    <Portal>
      <Show when={props.customButton}>
        {/* @ts-expect-error ignore */}
        <props.customButton isOpen={isOpen()} onClick={toggleDrawer} />
      </Show>
      <ResizerBorder>
        <As
          as="div"
          css={[
            `return \`._id {
  ${props.drawerClass}
  height: 100%;
}\`;`,
            STYLES.overflowCss,
          ]}
        >
          {props.children}
        </As>
        <Resizer />
      </ResizerBorder>
      {/* <div
        class={`${isOpen() ? "block" : "none"} h:100% left:0 position:fixed top:0 w:100%`}
        onClick={toggleDrawer}
      /> */}
    </Portal>
  );
}
