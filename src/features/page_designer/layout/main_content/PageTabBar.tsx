import { Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss, toolBarCss } from "~/pages/settings/constants";

import { DebugInfo } from "../page_tabbar/DebugInfo";
import { RefreshButton } from "../page_tabbar/RefreshButton";
import { ResizeViewButtons } from "../page_tabbar/ResizeViewButtons";
import { SaveIconButton } from "../page_tabbar/SaveIconButton";
import { ShareButton } from "../page_tabbar/ShareButton";
import { UndoRedoIcons } from "../page_tabbar/UndoRedoIcons";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";

export function PageTabBar(props: {
  formStoreId: Id;
  handleRefresh: () => void;
  onClose?: () => void;
  openIndex: number;
  previewsLength?: number;
}) {
  return (
    <As as="header" css={toolBarCss}>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
}\`;`}
      >
        <UndoRedoIcons formStoreId={props.formStoreId} />
        <ResizeViewButtons
          formStoreId={props.formStoreId}
          openIndex={props.openIndex}
        />
        {/* <SettingPageIcon /> */}
      </As>

      <DebugInfo formStoreId={props.formStoreId} />
      {/* <Show when={layoutStore().selectedSection === "setting"}>
              <div css={`return \`._id {
  display: flex;
  align-items: center;
}\`;`}>
                <MiddleSectionButtons />
              </As>
            </Show> */}
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
}\`;`}
      >
        <RefreshButton handleRefresh={props.handleRefresh} />
        <SaveIconButton formStoreId={props.formStoreId} />
        <ShareButton formStoreId={props.formStoreId} />
        <Show when={props.previewsLength && props.previewsLength > 1}>
          <IconButton
            css={headerIconButtonCss}
            icon="ph:x-circle"
            onClick={props.onClose}
            title="Close Tab"
            tooltipGroup="page-buttons"
          />
        </Show>
      </As>
    </As>
  );
}
