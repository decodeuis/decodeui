import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, on, Show } from "solid-js";
import type { JSX } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import {
  resizeHandleStyles,
  resizeContainerStyles,
} from "~/components/styled/resizeHandleStyles";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import {
  formatCSSCode,
  formatJavaScriptCode,
} from "~/lib/data_structure/string/formatUtils";
import { validateFunction } from "~/lib/validation/validateFunction";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Id } from "~/lib/graph/type/id";
import { useGraph } from "~/lib/graph/context/UseGraph";

// import onigasm from 'onigasm/lib/onigasm.wasm?url';

// Shared button styles
const buttonStyles = (color: string) => `return \`._id {
  padding: 1px 4px;
  background-color: ${color};
  color: \${args.theme.var.color.primary_text};
  border-radius: 1px;
  border: none;
}\`;`;

// Button components
const EditorButton = (props: {
  onClick: () => void;
  color: string;
  children: JSX.Element;
  title?: string;
  disabled?: boolean;
}) => (
  <As
    as="button"
    css={[
      buttonStyles(props.color),
      `return \`._id {
      opacity: ${props.disabled ? "0.5" : "1"};
      cursor: ${props.disabled ? "not-allowed" : "pointer"};
    }\`;`,
    ]}
    onClick={props.onClick}
    title={props.title}
    disabled={props.disabled}
  >
    {props.children}
  </As>
);

export function FunctionEditor(props: {
  keyName?: string;
  label?: string;
  language?: string;
  returnType?: "object" | "string";
  defaultValue?: string;
  setPropertyValue: (meta: Vertex, value: unknown) => void;
  vertexId?: Id; // Optional: specific vertex to track instead of selected
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // Determine which vertex to track - either specific vertex or selected
  const targetVertexId = () => props.vertexId ?? formStoreVertex()?.P.selectedId;

  // Derived state
  const propertyKey = () => props.keyName || "props";
  const getPropertyValue = () => {
    const currentValue =
      graph.vertexes[targetVertexId()]?.P[propertyKey()];

    // If value exists, return it
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    // Use prop defaultValue if provided
    if (props.defaultValue !== undefined) {
      return props.defaultValue;
    }

    // Default values based on keyName
    if (propertyKey() === "css") {
      return "return `._id {\n  \n}`;";
    }
    if (propertyKey() === "fns" || propertyKey() === "props") {
      return "return {\n  \n}";
    }

    // Fallback to empty string for other cases
    return "";
  };

  // State
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editorValue, setEditorValue] = createSignal(getPropertyValue());
  const [originalValue, setOriginalValue] = createSignal(getPropertyValue());
  const [hasChanges, setHasChanges] = createSignal(false);

  // Editor reference
  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  // Update editor value when target element changes or property value changes
  createEffect(
    on(
      () => {
        const vertexId = targetVertexId();
        const propertyValue = vertexId !== -1 && vertexId !== undefined
          ? graph.vertexes[vertexId]?.P[propertyKey()]
          : undefined;
        return { vertexId, propertyValue };
      },
      ({ vertexId, propertyValue }) => {
        if (vertexId !== -1 && vertexId !== undefined) {
          const newValue = getPropertyValue();
          setIsFunctionValid(true);
          setEditorValue(newValue);
          setOriginalValue(newValue);
          setHasChanges(false);
          
          // Update Monaco editor if it exists
          if (editorRef) {
            const model = editorRef.getModel();
            if (model && model.getValue() !== newValue) {
              model.setValue(newValue);
            }
          }
        }
      },
      { defer: true },
    ),
  );

  // Check for changes when editor value updates
  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setHasChanges(value !== originalValue());
  };

  // Handlers
  const evaluateProperty = (value: string) => {
    const validation = validateFunction(value, props.returnType);
    setIsFunctionValid(validation.isValid);

    if (validation.isValid) {
      props.setPropertyValue(
        { P: { key: propertyKey() } } as unknown as Vertex,
        value,
      );
      setOriginalValue(value);
      setHasChanges(false);
    } else {
      console.error("Function validation error:", validation.error);
    }
  };

  const handleSave = () => {
    evaluateProperty(editorValue());
    if (isFunctionValid()) {
      setIsModalOpen(false);
    }
  };

  const formatCode = async () => {
    if (!editorRef) {
      return;
    }

    const model = editorRef.getModel();
    if (!model) {
      return;
    }

    try {
      const language = props.language?.toLowerCase() || "javascript";
      const isJavaScript = [
        "javascript",
        "typescript",
        "js",
        "ts",
        "jsx",
        "tsx",
      ].includes(language);

      if (isJavaScript) {
        const formatted = await formatJavaScriptCode(model.getValue());
        model.setValue(formatted);
        setHasChanges(formatted !== originalValue());
      } else if (language === "css") {
        const formatted = await formatCSSCode(model.getValue());
        model.setValue(formatted);
        setHasChanges(formatted !== originalValue());
      } else {
        console.warn(`Formatting not supported for ${language} language`);
      }
    } catch (err) {
      console.error("Formatting failed:", err);
    }
  };

  // UI Components
  const EditorContent = (p: { maxHeight?: string }) => {
    // Calculate initial height based on content
    const calculateInitialHeight = () => {
      const lines = editorValue().split("\n").length;
      const lineHeight = 19; // Monaco editor default line height
      const padding = 40; // Extra padding for scrollbar and margins
      const minHeight = 100;
      const maxHeight = p.maxHeight ? Number.parseInt(p.maxHeight) : 400; // Use provided maxHeight or default

      const calculatedHeight = Math.min(
        Math.max(lines * lineHeight + padding, minHeight),
        maxHeight,
      );
      return `${calculatedHeight}px`;
    };

    const [editorHeight, setEditorHeight] = createSignal(
      calculateInitialHeight(),
    );
    let resizableEditorAreaRef: HTMLDivElement | undefined; // Ref for the area containing editor + handle
    let dragStartEditorHeight = 0;
    let dragStartY = 0;

    // Update height when content changes
    createEffect(() => {
      editorValue(); // Track changes
      if (!isModalOpen()) {
        // Only auto-adjust for inline editor
        setEditorHeight(calculateInitialHeight());
      }
    });

    const onMouseDownResize = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragStartEditorHeight = Number.parseFloat(
        editorHeight().replace("px", ""),
      );
      dragStartY = e.clientY;

      const onMouseMoveResize = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - dragStartY;
        const newHeight = dragStartEditorHeight + deltaY;
        setEditorHeight(`${Math.max(100, newHeight)}px`); // Minimum height 100px
      };

      const onMouseUpResize = () => {
        document.removeEventListener("mousemove", onMouseMoveResize);
        document.removeEventListener("mouseup", onMouseUpResize);
      };

      document.addEventListener("mousemove", onMouseMoveResize);
      document.addEventListener("mouseup", onMouseUpResize);
    };

    return (
      // Main container for all parts of EditorContent (editor, buttons, messages)
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          flex-direction: column;
          gap: 8px; /* Gap between resizable editor area and buttons below */
        }\`;`}
      >
        {/* Wrapper for the resizable editor and its handle */}
        <As as="div" ref={resizableEditorAreaRef} css={resizeContainerStyles}>
          <MonacoEditorWrapper
            error={!isFunctionValid()}
            height={editorHeight()}
            language={props.language || "javascript"}
            onChange={handleEditorChange}
            onMount={(_monaco, editor) => (editorRef = editor)}
            showMinimap={false}
            value={editorValue()}
          />
          {/* Resize Handle - positioned absolutely to resizableEditorAreaRef */}
          <As
            as="div"
            onMouseDown={onMouseDownResize}
            css={resizeHandleStyles}
          />
        </As>

        {/* Buttons container - now follows the resizable editor area */}
        <As
          as="div"
          css={`return \`._id {
            display: flex;
            gap: 4px;
          }\`;`}
        >
          <EditorButton
            color={"${args.theme.var.color.primary}"}
            onClick={handleSave}
            disabled={!hasChanges()}
          >
            Submit
          </EditorButton>

          <EditorButton
            color={"${args.theme.var.color.primary_light_300}"}
            onClick={formatCode}
            title="Format Code with Prettier"
          >
            Format
          </EditorButton>

          <Show when={isModalOpen()}>
            <As as="div" css={`return \`._id { margin-left: auto; }\`;`}>
              <EditorButton
                color={"${args.theme.var.color.error_light_800}"}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </EditorButton>
            </As>
          </Show>
        </As>

        {/* Invalid Function message - also follows buttons */}
        <Show when={!isFunctionValid()}>
          <As
            as="span"
            css={`return \`._id {
              color: \${args.theme.var.color.error};
              margin-top: 4px; 
            }\`;`}
          >
            Invalid Function
          </As>
        </Show>
      </As>
    );
  };

  return (
    <>
      <As as="div" css={`return \`._id { margin-top: 5px; }\`;`}>
        <As
          as="span"
          css={`return \`._id { display: flex; align-items: center; }\`;`}
        >
          {props.label}
          <IconButton
            css={`return \`._id {
              margin-left: 6px;
              background-color: transparent;
              border: none;
            }\`;`}
            icon="ph:arrow-square-out"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Edit Function in Modal"
          />
        </As>
        <EditorContent />
      </As>

      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={`Edit ${props.label}`}
      >
        <As
          as="div"
          css={`return \`._id {
            padding: 3px;
            width: 600px;
            height: 600px;
          }\`;`}
        >
          <EditorContent maxHeight="560px" />
        </As>
      </CustomModal>
    </>
  );
}
