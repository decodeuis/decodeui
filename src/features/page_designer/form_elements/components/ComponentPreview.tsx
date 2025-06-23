import { createSignal, Show, onCleanup } from "solid-js";
import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { PreviewIsolated } from "../pages/PreviewIsolated";
import { buttonStyle } from "../common/ItemStyles";
import type { Vertex } from "~/lib/graph/type/vertex";
import { As } from "~/components/As";

export function ComponentPreview(props: {
  item: Vertex;
  onClick?: (e: MouseEvent) => void;
  onPreviewOpen?: () => void;
  onPreviewClose?: () => void;
}) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  // Use a custom preview handler that doesn't automatically close
  const openPreview = () => {
    setIsOpen(true);
    props.onPreviewOpen?.();
  };

  const closePreview = () => {
    setIsOpen(false);
    props.onPreviewClose?.();
  };

  // Clean up timeout if needed
  let timeoutId: number | null = null;
  onCleanup(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });

  const handleButtonClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (isOpen()) {
      closePreview();
    } else {
      openPreview();
    }

    props.onClick?.(e);
  };

  const handleButtonMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = window.setTimeout(() => {
      openPreview();
    }, 500); // Delay before showing preview
  };

  const handleButtonMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = window.setTimeout(() => {
      closePreview();
    }, 300);
  };

  const handleDropdownMouseEnter = (e: MouseEvent) => {
    e.stopPropagation();

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleDropdownMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();

    timeoutId = window.setTimeout(() => {
      closePreview();
    }, 300);
  };

  return (
    <>
      <IconButton
        css={buttonStyle}
        icon="ph:eye"
        onClick={handleButtonClick}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        ref={setButtonRef}
        size={18}
        title="Preview"
      />

      <Show when={isOpen() && buttonRef()}>
        <DropdownMenu
          data-preview-dropdown
          css={`return \`._id {
            height: 800px;
            width: 800px;
            overflow: auto;
          }\`;`}
          offset={{ crossAxis: 30 }}
          onClickOutside={closePreview}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          parentRef={buttonRef() as HTMLElement}
        >
          <As
            as="div"
            css={`return \`._id {
            height: 100%;
            width: 100%;
            overflow: auto;
          }\`;`}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
          >
            <PreviewIsolated item={props.item} />
          </As>
        </DropdownMenu>
      </Show>
    </>
  );
}
