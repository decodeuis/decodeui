import { Style } from "@solidjs/meta";
import { createMemo, For, Show, untrack } from "solid-js";

type StyleRendererProps = {
  cssContent: string | string[] | undefined;
  id: string;
};

export function StyleRenderer(props: StyleRendererProps) {
  const processCss = (css: string): string => {
    return css.replace(/\._id/g, `.${props.id}`);
  };
  const processedContent = () => {
    if (!props.cssContent) {
      return undefined;
    }

    if (Array.isArray(props.cssContent)) {
      return props.cssContent
        .filter((css) => typeof css === "string" && css.trim() !== "") // Filter out empty strings and non-string values
        .map(processCss);
    }
    return typeof props.cssContent === "string" &&
      props.cssContent.trim() !== ""
      ? processCss(props.cssContent)
      : undefined;
  };

  const content = createMemo(() => processedContent());

  return (
    <>
      <Show when={Array.isArray(content())}>
        <For each={content() as string[]}>
          {(style) => (
            <Show when={style} keyed>
              <Style2 cssContent={style} />
            </Show>
          )}
        </For>
      </Show>

      <Show when={!Array.isArray(content()) && content()} keyed>
        <Style2 cssContent={content() as string} />
      </Show>
    </>
  );
}

export function Style2(props: { cssContent: string }) {
  const cssContent = untrack(() => props.cssContent);
  return <Style>{cssContent}</Style>;
}
