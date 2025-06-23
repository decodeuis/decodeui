import {
  createEffect,
  createSignal,
  For,
  type JSX,
  Match,
  onCleanup,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { As } from "../As";
import type { Vertex } from "~/lib/graph/type/vertex";

export type FileUploaderProps = JSX.HTMLAttributes<HTMLInputElement> & {
  data?: Vertex;
  handleFileSelect?: (data: FileList | null) => void;
  hidePreview?: boolean;
  label?: string;
  media?: string;
  meta?: Vertex;
  multiple?: boolean;
  setValue?: (files: FileList) => void;
  txnId?: number;
};

export function FileUploader(props: FileUploaderProps) {
  const [localProps, others] = splitProps(props, [
    "setValue",
    "meta",
    "data",
    "label",
    "media",
    "handleFileSelect",
    "multiple",
    "hidePreview",
  ]);
  const [files, setFiles] = createSignal<File[]>([]);
  const [previewUrls, setPreviewUrls] = createSignal<string[]>([]);
  let inputRef: HTMLInputElement | undefined;

  // on file select
  // 4. on reload it should display preview.
  const setValue = async (fileList?: FileList | null) => {
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);

      // Create object URLs for each file
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);

      // Call handleFileSelect if provided
      if (localProps.handleFileSelect) {
        localProps.handleFileSelect(fileList);
      }
    }
  };

  createEffect(() => {
    if (localProps.media) {
      // If media is a string, create a single-item array
      setPreviewUrls([localProps.media]);
    }
  });

  // Clean up object URLs when component unmounts
  onCleanup(() => {
    previewUrls().forEach((url) => URL.revokeObjectURL(url));
  });

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setValue(event.dataTransfer?.files);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    setValue(input.files);
  };

  const handleFullBoxClick = () => {
    if (inputRef) {
      inputRef.click();
    }
  };

  return (
    <>
      <As
        as="button"
        css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
        onClick={handleFullBoxClick}
        type="button"
      >
        {localProps.label || `Select ${localProps.multiple ? "Files" : "File"}`}
      </As>

      <input
        accept="image/*, video/*"
        multiple={localProps.multiple}
        onChange={(event) => {
          handleInputChange(event);
        }}
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
        {...others}
      />
      <Show
        when={
          (files().length > 0 || previewUrls().length > 0) &&
          !(localProps.hidePreview ?? true)
        }
      >
        <As
          as="div"
          css={`return \`._id {
  background-position: center;
  background-size: cover;
  ${previewUrls().length === 0 ? "border:2px dashed #ccc" : ""}
  border-radius: 10px;
  cursor: pointer;
  min-height: 200px;
  position: relative;
  text-align: center;
}\`;`}
          draggable={false}
          onClick={handleFullBoxClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Switch>
            <Match when={files().length > 0 || previewUrls().length > 0}>
              <As
                as="div"
                css={`return \`._id {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 10px;
}\`;`}
              >
                <For each={files().length > 0 ? files() : [null]}>
                  {(file, index) => (
                    <As
                      as="div"
                      css={`return \`._id {
  max-width: 200px;
  max-height: 200px;
  margin: 5px;
}\`;`}
                    >
                      <Switch>
                        <Match when={file?.type.startsWith("image/")}>
                          <As
                            as="img"
                            alt="Media"
                            css={`return \`._id {
  border-radius: 10px;
  max-height: 100%;
  max-width: 100%;
}\`;`}
                            src={previewUrls()[index()]}
                          />
                        </Match>
                        <Match when={file?.type.startsWith("video/")}>
                          <As
                            as="video"
                            css={`return \`._id {
  border-radius: 10px;
  max-height: 100%;
  max-width: 100%;
}\`;`}
                            controls
                            src={previewUrls()[index()]}
                          />
                        </Match>
                        <Match when={!file && previewUrls().length > 0}>
                          <As
                            as="img"
                            alt="Media"
                            css={`return \`._id {
  border-radius: 10px;
  max-height: 100%;
  max-width: 100%;
}\`;`}
                            src={previewUrls()[index()]}
                          />
                        </Match>
                      </Switch>
                    </As>
                  )}
                </For>
              </As>
            </Match>
          </Switch>
        </As>
      </Show>
    </>
  );
}
