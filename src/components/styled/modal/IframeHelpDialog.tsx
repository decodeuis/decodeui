import { createSignal, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { As } from "~/components/As";

interface IframeHelpDialogProps {
  icon?: string;
  iconSize?: number;
  iframeSrc?: string;
  iframeTitle?: string;
  title?: string;
}

export function IframeHelpDialog(props: IframeHelpDialogProps) {
  const [open, setOpen] = createSignal(false);

  const handleIconClick = () => {
    setOpen(true);
  };

  return (
    <>
      <IconButton
        icon={props.icon}
        css={`return \`._id {
          background-color: transparent;
          border: none;
        }\`;`}
        onClick={handleIconClick}
        size={props.iconSize || 24}
      />
      <Show when={open()}>
        <CustomModal
          bodyCss={`return \`._id {height: 100%;}\`;`}
          dialogCss={`return \`._id {width: 90vw; border-radius: 10px; padding: 0; height: 90vh; display: flex; flex-direction: column;}\`;`}
          footer={() => (
            <DialogFooter
              buttonText="Close"
              css={[
                SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS,
                `return \`._id {
                margin-left: auto;
                margin-right: 8px;
                margin-top: 4px;
              }\`;`,
              ]}
              containerCss={`return \`._id {
  margin-top: auto;
}\`;`}
              onClick={() => {
                setOpen(false);
              }}
              type="button"
            />
          )}
          isCloseOnOutsideClick={true}
          open={open}
          setOpen={setOpen}
          title={props.title}
        >
          <As
            as="iframe"
            allow="clipboard-write"
            css={`return \`._id {
              height: 100%;
              width: 100%;
            }\`;`}
            src={props.iframeSrc}
            title={props.iframeTitle}
          />
        </CustomModal>
      </Show>
    </>
  );
}
