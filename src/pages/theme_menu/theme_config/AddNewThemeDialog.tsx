import { createSignal, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { SETTINGS_CONSTANTS } from "../../settings/constants";
import { getThemeFormSchema } from "./schema/themeFormSchema";

export function AddNewThemeDialog() {
  const [showDialog, setShowDialog] = createSignal(false);

  const handleSuccess = () => {
    setShowDialog(false);
  };

  return (
    <>
      <DialogFooter
        buttonText="Add New Theme"
        css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
        onClick={() => setShowDialog(true)}
      />
      <Show when={showDialog()}>
        <SchemaRenderer
          form={getThemeFormSchema(handleSuccess, () => setShowDialog(false))}
        />
      </Show>
    </>
  );
}
