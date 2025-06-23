import type * as Monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { MonacoEditor } from "solid-monaco";
import { createMemo } from "solid-js";
import { useThemeMode } from "~/lib/theme/useThemeMode";

// import onigasm from 'onigasm/lib/onigasm.wasm?url';
import { PROPERTIES } from "~/pages/settings/constants";
import { As } from "../As";

// Initialize Monaco workers if not already done
if (!window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker(_moduleId: unknown, label: string) {
      switch (label) {
        case "css":
          return new cssWorker();
        case "javascript":
        case "typescript":
          return new tsWorker();
        case "json":
          return new jsonWorker();
        default:
          return new editorWorker();
      }
    },
    // onigasm,
  };
}

export interface MonacoEditorWrapperProps {
  error?: boolean;
  height?: string;
  language?: string;
  onChange: (value: string) => void;
  onMount?: (
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
  ) => void;
  showMinimap?: boolean;
  value: string;
}

export function MonacoEditorWrapper(props: Readonly<MonacoEditorWrapperProps>) {
  const themeMode = useThemeMode();

  const theme = createMemo(() => {
    return themeMode() === "dark" ? "vs-dark" : "vs";
  });

  // Flag to track if we've initialized our extensions
  let extensionsInitialized = false;
  // Handle editor mount and setup custom language extensions if needed
  const handleEditorMount = (
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
  ) => {
    // Initialize extensions only once
    if (!extensionsInitialized) {
      extensionsInitialized = true;
    }

    // Call the original onMount handler
    props.onMount?.(monaco, editor);
  };

  return (
    <As
      as={MonacoEditor}
      css={[
        PROPERTIES.Css.TextFieldCss,
        `return \`._id {
          ${props.error ? "b: error" : ""}
        }\`;`,
      ]}
      height={props.height ?? "200px"}
      language={props.language}
      onChange={(value: string) => props.onChange(value)}
      onMount={handleEditorMount}
      options={{
        autoIndent: "full",
        theme: theme(),
        folding: false,
        fontSize: 14,
        formatOnPaste: true,
        formatOnType: true,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbers: "off",
        lineNumbersMinChars: 0,
        minimap: { enabled: props.showMinimap ?? false },
        scrollbar: {
          // https://github.com/kubernetes-sigs/kui/issues/6480
          alwaysConsumeMouseWheel: false,
          horizontalScrollbarSize: 5,
          verticalScrollbarSize: 5,
          horizontal: "auto",
          vertical: "auto",
          handleMouseWheel: true,
          scrollByPage: false,
        },
        scrollBeyondLastLine: false,
        tabSize: 2,
      }}
      value={props.value}
    />
  );
}
