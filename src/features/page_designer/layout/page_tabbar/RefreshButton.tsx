import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { onMount, onCleanup } from "solid-js";

export function RefreshButton(props: { handleRefresh: () => void }) {
  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Refresh - F5 or Ctrl+R
    if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key === "u")) {
      e.preventDefault();
      props.handleRefresh();
    }
  };

  // Register and clean up event listeners
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <IconButton
      css={headerIconButtonCss}
      size={18}
      icon="ph:arrows-counter-clockwise"
      onClick={props.handleRefresh}
      title="Refresh Preview (F5 or Ctrl+U)"
      tooltipGroup="page-buttons"
    />
  );
}
