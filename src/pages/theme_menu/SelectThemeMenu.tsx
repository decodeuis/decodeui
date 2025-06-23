import { createSignal, For, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import type { GraphData } from "~/lib/types/GraphData";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/store/getGlobalSettingVertex";
import { getGlobalThemeVertex } from "~/lib/graph/get/sync/store/getGlobalThemeVertex";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import { handleDataSubmission } from "~/lib/graph/mutate/data/handleDataSubmission";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { GlobalSetting } from "~/lib/meta/base/GlobalSetting";

import { SETTINGS_CONSTANTS } from "../settings/constants";
import { AddNewThemeDialog } from "./theme_config/AddNewThemeDialog";
import { ThemeConfigEditButton } from "./theme_config/ThemeConfigEditButton";
import { ThemePreview } from "./theme_config/ThemePreview";
import { ThemeColorVariantsPreview } from "./theme_config/ThemeColorVariantsPreview";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function SelectThemeMenu(props: { isStandalone?: boolean }) {
  const [graph, setGraph] = useGraph();
  const [loading, setLoading] = createSignal(true);
  const { showErrorToast, showSuccessToast } = useToast();
  const [error, setError] = createSignal<null | string>(null);
  const [confirmDelete, setConfirmDelete] = createSignal<Id | null>(null);

  const loadThemes = async () => {
    const result = await fetchAndSetGraphData(graph, setGraph, "g:'Theme'");
    if (result.error) {
      showErrorToast(result.error);
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  onMount(() => {
    loadThemes();
  });

  const handleThemeSelect = async (themeId: Id) => {
    const globalSettingVertex = getGlobalSettingVertex(graph);
    if (!globalSettingVertex) {
      return;
    }

    const newFormTxnId = generateNewTxnId(graph, setGraph);

    const themeMetaAttribute = GlobalSetting.attributes.find(
      (attr) => attr.key === "Theme",
    );
    if (!themeMetaAttribute) {
      return;
    }

    const selectedThemeMetaVertex: Vertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: { type: "GlobalSettingTheme" },
    };

    setSelectionValue(
      newFormTxnId,
      globalSettingVertex,
      graph,
      setGraph,
      selectedThemeMetaVertex,
      themeId,
    );

    await handleDataSubmission(
      newFormTxnId,
      graph,
      setGraph,
      showErrorToast,
      showSuccessToast,
      {
        errorMessage: "An error occurred while selecting the theme",
        successMessage: null,
      },
    );
  };

  const confirmDeleteTheme = (themeId: Id) => {
    setConfirmDelete(themeId);
  };

  const handleDeleteConfirmation = async () => {
    const themeId = confirmDelete();
    if (themeId === null) {
      return;
    }

    setConfirmDelete(null);

    try {
      const result = await postAPI(
        API.settings.theme.deleteUrl,
        { themeId },
        "DELETE",
      );
      if (result.success) {
        if (result.graph) {
          setGraphData(graph, setGraph, result.graph as GraphData);
        }
        showSuccessToast("Theme deleted successfully");
        loadThemes(); // Reload themes after deletion
      }
    } catch (error) {
      showErrorToast((error as Error).message || "Failed to delete theme");
    }
  };

  return (
    <>
      <Show when={!props.isStandalone}>
        <DialogHeader title="Themes" />
      </Show>
      <Show when={error()}>
        <As
          as="div"
          css={`return \`._id {
  padding: 0.5rem;
  color: \${args.theme.var.color.error};
}\`;`}
        >
          {error()}
        </As>
      </Show>
      <Show when={loading()}>
        <As
          as="div"
          css={`return \`._id {
  padding: 0.5rem;
}\`;`}
        >
          Loading...
        </As>
      </Show>
      <AddNewThemeDialog />
      <Show when={!(loading() || error())}>
        <As
          as="ul"
          css={`return \`._id {
  width: 100%;
  padding: 0;
  ${props.isStandalone ? "max-height:none;" : "max-height: 300px;"}
  overflow-y: auto;
}\`;`}
        >
          <For each={graph.vertexLabelIdMap.Theme}>
            {(theme) => {
              const isSelected = () =>
                getGlobalThemeVertex(graph)?.id === theme;
              return (
                <As
                  as="li"
                  css={`return \`._id {
  ${isSelected() ? "background-color: ${args.theme.var.color.primary_light_400}; color: ${args.theme.var.color.primary_light_400_text};" : ""}
  display: flex;
  align-items: center;  
  justify-content: space-between;
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid \${args.theme.var.color.border};
  &:hover {
    background-color: \${args.theme.var.color.primary_light_200};
    color: \${args.theme.var.color.primary_light_200_text};
  }
}\`;`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}\`;`}
                  >
                    <Show when={isSelected()}>
                      <As
                        as="span"
                        css={`return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 1.2rem;
}\`;`}
                      >
                        ✓
                      </As>
                    </Show>
                    <span>{graph.vertexes[theme].P.key}</span>
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}\`;`}
                  >
                    <ThemePreview item={graph.vertexes[theme]} />

                    <ThemeConfigEditButton
                      item={graph.vertexes[theme]}
                      size={18}
                    />

                    <Show when={!isSelected()}>
                      <IconButton
                        css={`return \`._id {
  color: \${args.theme.var.color.error};
  background-color: transparent;
  border: none;
  padding: 1px;
  cursor: pointer;
  &:hover {
    color: \${args.theme.var.color.error_dark_400};
}\`;`}
                        icon="ph:trash"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteTheme(theme);
                        }}
                        size={18}
                        title="Delete Theme"
                        tooltipGroup="theme-actions"
                      />
                    </Show>
                  </As>
                </As>
              );
            }}
          </For>
        </As>
      </Show>

      {/* Show color variants preview when in standalone mode */}
      <Show when={props.isStandalone && getGlobalThemeVertex(graph)}>
        <ThemeColorVariantsPreview themeVertex={getGlobalThemeVertex(graph)!} />
      </Show>

      <Show when={confirmDelete()}>
        <Portal>
          <As as="div" css={SETTINGS_CONSTANTS.MODAL.CONTAINER_CSS}>
            <As as="div" css={SETTINGS_CONSTANTS.MODAL.HEADER.CSS}>
              <As as="h3" css={SETTINGS_CONSTANTS.MODAL.HEADER.TEXT_CSS}>
                Delete Theme
              </As>
            </As>
            <As as="p" css={SETTINGS_CONSTANTS.MODAL.BODY.CSS}>
              Are you sure you want to delete this theme?
            </As>
            <As as="div" css={SETTINGS_CONSTANTS.MODAL.FOOTER.CSS}>
              <As
                as="button"
                css={SETTINGS_CONSTANTS.MODAL.BUTTONS.DELETE_CSS}
                onClick={handleDeleteConfirmation}
              >
                Yes
              </As>
              <As
                as="button"
                css={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CSS}
                onClick={() => setConfirmDelete(null)}
              >
                No
              </As>
            </As>
          </As>
        </Portal>
      </Show>
    </>
  );
}
