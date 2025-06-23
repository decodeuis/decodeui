import { createSignal, type Setter } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useDesignerLayoutStore } from "~/features/page_designer/context/LayoutContext";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

export function PreviewCSSMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: (event: MouseEvent) => void;
    parentRef: HTMLElement;
    ref: Setter<HTMLElement | null>;
  }>,
) {
  const [_layoutStore] = useDesignerLayoutStore();
  // TODO: fix this
  const [cssContent, _setCssContent] = createSignal("ABC");

  return (
    <DropdownMenu
      css={`return \`._id {
  padding: 0.50rem;
}\`;`}
      onClickOutside={props.onClose}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      ref={props.ref}
    >
      <DialogHeader title="Preview CSS" />
      <DialogSubTitle>View the CSS content below:</DialogSubTitle>

      <As
        as="div"
        css={`return \`._id {
  margin-top: 2px;
}\`;`}
      >
        <code>{cssContent()}</code>
      </As>

      <DialogFooter>
        <As
          as="button"
          css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
          onClick={props.onClose}
          type="button"
        >
          Close
        </As>
      </DialogFooter>
    </DropdownMenu>
  );
}
