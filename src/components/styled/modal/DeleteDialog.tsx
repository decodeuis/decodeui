import { autofocus } from "@solid-primitives/autofocus";
import { type Accessor, Show } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { CustomModal } from "./CustomModal";
import { As } from "~/components/As";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus;

export function DialogWithButtons(
  props: Readonly<{
    hasPermission?: boolean;
    message?: string;
    onCancel?: () => void;
    onConfirm: () => void;
    open?: Accessor<boolean>;
    setOpen?: (open: boolean) => void;
    title?: string;
  }>,
) {
  const handleConfirm = () => {
    if (props.hasPermission ?? true) {
      props.onConfirm();
    }
  };

  return (
    <CustomModal
      customTitle={<span>{props.title}</span>}
      dialogCss={`return \`._id {min-width: 20%; border-radius: 10px; padding: 0;}\`;`}
      footer={() => (
        <As as="div" css={[SETTINGS_CONSTANTS.MODAL.FOOTER.CSS]}>
          <Show when={props.hasPermission ?? true}>
            <As
              as="button"
              css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CSS]}
              onClick={handleConfirm}
              type="button"
            >
              Confirm
            </As>
          </Show>
          <As
            as="button"
            ref={el=>{
              setTimeout(() => el.focus(), 200)
            }}
            css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS]}
            onClick={props.onCancel}
            type="button"
          >
            Cancel
          </As>
        </As>
      )}
      open={props.open}
      setOpen={props.setOpen}
    >
      <Show
        fallback={
          <As as="p" css={[SETTINGS_CONSTANTS.MODAL.BODY.CSS]}>
            You do not have permission to perform the action.
          </As>
        }
        when={props.hasPermission ?? true}
      >
        <As as="p" css={[SETTINGS_CONSTANTS.MODAL.BODY.CSS]}>
          {props.message}
        </As>
      </Show>
    </CustomModal>
  );
}
