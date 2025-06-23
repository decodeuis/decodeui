import { type Component, createMemo, type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { StyleRenderer } from "./StyleRenderer";

import type { FunctionArgumentType } from "./form/type/FieldSchemaType";
import { useTheme } from "~/lib/theme/ThemeContext";
import { processCssContent } from "~/lib/styles/processCss";
import { createUniqueId } from "~/lib/solid/createUniqueId";
import type { CssType } from "~/components/form/type/CssType";

type ElementProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  css?: CssType;
  class?: string;
  asProp?: string;
} & Omit<JSX.IntrinsicElements[T], "as" | "css" | "class">;

// Allow any component props
type CustomComponentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: Component<any>;
  css?: CssType;
  class?: string;
  asProp?: string;
  [key: string]: unknown;
};

type AsProps<T> = T extends keyof JSX.IntrinsicElements
  ? ElementProps<T>
  : CustomComponentProps;

/**
 * A component that wraps any HTML element or custom component and applies CSS styles.
 *
 * @example Using with HTML elements
 * ```tsx
 * // With a div element
 * <As as="div" css={myCss}>Content</As>
 *
 * // With a button element
 * <As as="button" onClick={handleClick} css={buttonCss}>Click me</As>
 * ```
 *
 * @example Using with custom components like DynamicComponent
 * ```tsx
 * // All component props are properly typed and passed through
 * <As
 *   as={DynamicComponent}
 *   componentName="SystemTextInput"
 *   name="username"
 *   label="Username"
 *   onChange={(value) => console.log(value)}
 *   css={inputCss}
 * />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function As<T extends keyof JSX.IntrinsicElements | Component<any>>(
  props: AsProps<T>,
): JSX.Element {
  const theme = useTheme();
  const [local, rest] = splitProps(props, ["as", "css", "class", "asProp"]);
  const uniqueId = createUniqueId();

  const getCssContent = createMemo(() => {
    if (!local.css) {
      return undefined;
    }

    const functionArgs = { theme } as FunctionArgumentType;
    return processCssContent(local.css, functionArgs, uniqueId);
  });

  const finalClass = () => {
    const uniqueId2 = getCssContent() ? uniqueId : "";
    return uniqueId2 ? `${uniqueId2} ${local.class || ""}`.trim() : local.class;
  };

  return (
    <>
      <StyleRenderer cssContent={getCssContent()} id={uniqueId} />
      {/* @ts-expect-error - Dynamic component typing with generics requires this */}
      <Dynamic
        component={local.as}
        {...rest}
        class={finalClass()}
        as={local.asProp}
      />
    </>
  );
}
