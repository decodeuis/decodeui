import type {
  JsonEditor,
  MenuButton,
  MenuItem,
  MenuSeparator,
  RenderMenuContext,
} from "vanilla-jsoneditor";
import { createJSONEditor } from "vanilla-jsoneditor";

import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { useIsDarkMode } from "~/lib/theme/useThemeMode";

// Import the dark theme CSS
import "vanilla-jsoneditor/themes/jse-theme-dark.css";

interface VanilaJsonEditorProps {
  json: unknown;
  onChange: (updatedContent: string) => void;
  height?: string;
  autoHeight?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

// https://github.com/josdejong/svelte-jsoneditor/issues/473
// https://github.com/josdejong/svelte-jsoneditor
export function VanilaJsonEditor(props: VanilaJsonEditorProps) {
  let containerRef: HTMLDivElement | undefined;
  let mutationObserver: MutationObserver | undefined;
  const [editor, setEditor] = createSignal<JsonEditor | undefined>(undefined);
  const [currentContent, setCurrentContent] = createSignal<unknown>(props.json);
  const [containerHeight, setContainerHeight] = createSignal<string>(
    props.height || "200px",
  );

  const isDarkMode = useIsDarkMode();

  // Update editor when props.json changes
  createEffect(() => {
    if (editor()) {
      const newJson = JSON.parse(JSON.stringify(props.json));
      editor()!.update({ json: newJson });
      setCurrentContent(newJson);

      // Trigger height recalculation when content changes
      if (props.autoHeight) {
        setTimeout(updateHeight, 100);
      }
    }
  });

  // Function to update height based on content
  const updateHeight = () => {
    if (!containerRef || !props.autoHeight) return;

    // Find the main container and contents
    const mainContainer = containerRef.querySelector(".jse-main");
    const contentsContainer = containerRef.querySelector(".jse-contents");

    if (!contentsContainer) {
      // Retry if not ready
      setTimeout(updateHeight, 100);
      return;
    }

    // Get the actual scroll height of the contents
    const contentScrollHeight = contentsContainer.scrollHeight;

    // Get other UI elements heights
    const menuBar = containerRef.querySelector(".jse-menu");
    const navigationBar = containerRef.querySelector(".jse-navigation-bar");

    const menuHeight = menuBar ? menuBar.offsetHeight : 0;
    const navHeight = navigationBar ? navigationBar.offsetHeight : 0;

    // Calculate total height
    const padding = 0; // Small padding
    const totalHeight = menuHeight + navHeight + contentScrollHeight + padding;

    // Apply constraints
    const minHeight = props.minHeight || 100;
    const maxHeight = props.maxHeight || 800;
    const finalHeight = Math.max(minHeight, Math.min(maxHeight, totalHeight));

    setContainerHeight(`${finalHeight}px`);
  };

  onMount(() => {
    if (!containerRef) {
      return;
    }

    async function handleCopy() {
      // Convert keys with spaces to underscores
      const processContent = (obj: any): any => {
        if (!obj || typeof obj !== "object") {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map((item) => processContent(item));
        }

        const result: any = {};
        for (const key in obj) {
          if (key === "") {
            continue; // Skip empty string keys
          }
          const newKey = key.includes(" ") ? key.replace(/ /g, "_") : key;
          result[newKey] = processContent(obj[key]);
        }
        return result;
      };

      const processedContent = processContent(currentContent());
      if (editor()) {
        editor()!.update({ json: processedContent });
      }
      props.onChange(JSON.stringify(processedContent));
    }

    function handleRenderMenu(
      items: MenuItem[],
      _context: RenderMenuContext,
    ): MenuItem[] | undefined {
      const separator: MenuSeparator = {
        type: "separator",
      };

      const faFloppyDisk = {
        icon: [
          448,
          512,
          [128190, 128426, "save"],
          "f0c7",
          "M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z",
        ],
        iconName: "floppy-disk",
        prefix: "fas",
      } as any;

      const customCopyButton: MenuButton = {
        className: "custom-copy-button",
        icon: faFloppyDisk,
        onClick: handleCopy,
        title: "Copy document to clipboard",
        type: "button",
      };

      // Filter out the text and table mode buttons
      const filteredItems = items.filter((item) => {
        if (
          item.type === "button" &&
          (item.text === "text" ||
            item.text === "table" ||
            item.text === "tree")
        ) {
          return false;
        }
        return true;
      });

      const head = filteredItems.slice(0, filteredItems.length - 1);
      const tail = filteredItems.slice(filteredItems.length - 1); // the tail contains space

      return head.concat(separator, customCopyButton, tail);
    }

    // Function to check if an object has keys with spaces
    function hasKeysWithSpaces(obj: any): boolean {
      if (!obj || typeof obj !== "object") {
        return false;
      }

      if (Array.isArray(obj)) {
        return obj.some((item) => hasKeysWithSpaces(item));
      }

      return Object.keys(obj).some((key) => {
        return key.includes(" ") || hasKeysWithSpaces(obj[key]);
      });
    }

    const newEditor = createJSONEditor({
      props: {
        content: {
          json: props.json,
        },
        mainMenuBar: true,
        mode: "tree",
        navigationBar: true,
        onChange: (
          updatedContent: any,
          _previousContent: any,
          { contentErrors, patchResult }: any,
        ) => {
          // content is an object { json: unknown } | { text: string }
          if (updatedContent.json !== undefined) {
            // Check if the updated content has keys with spaces
            // if (hasKeysWithSpaces(updatedContent.json)) {
            //   // If it does, don't update and show an alert
            //   alert("Key names cannot contain spaces");

            //   // Revert to previous content if possible
            //   if (editor) {
            //     editor.update({ json: currentContent() });
            //   }
            //   return;
            // }

            setCurrentContent(updatedContent.json);
          }
        },
        onChangeMode: (mode: any) => {
          // Force tree mode if user tries to switch to text or table
          if (mode !== "tree" && newEditor) {
            newEditor.updateProps({ mode: "tree" as any });
          }
        },
        onRenderMenu: handleRenderMenu,
      },
      target: containerRef,
    });

    setEditor(newEditor);

    // Initial height calculation
    if (props.autoHeight) {
      setTimeout(updateHeight, 200);

      // Watch for DOM changes (expanding/collapsing nodes)
      mutationObserver = new MutationObserver(() => {
        updateHeight();
      });

      // Start observing the container for changes
      mutationObserver.observe(containerRef, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
  });

  onCleanup(() => {
    if (editor()) {
      editor()!.destroy();
    }

    // Clean up observer
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = undefined;
    }
  });

  return (
    <div
      ref={containerRef}
      classList={{ "jse-theme-dark": isDarkMode() }}
      style={{
        height: props.autoHeight ? containerHeight() : props.height,
        overflow: "auto",
        width: "100%",
      }}
    />
  );
}
