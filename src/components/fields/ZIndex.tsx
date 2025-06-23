import { createContext, type JSX, useContext } from "solid-js";

const ZIndexContext = createContext<number>();

export function useZIndex(): number {
  const context = useContext(ZIndexContext);
  return context !== undefined ? context : 0;
}

export function ZIndex(
  props: Readonly<{
    children: JSX.Element;
    increaseCount?: number;
  }>,
): JSX.Element {
  const context = useContext(ZIndexContext);

  let zIndex: number;
  if (context === undefined) {
    zIndex = 0;
  } else {
    zIndex = context;
  }

  return (
    <ZIndexContext.Provider value={zIndex + (props.increaseCount ?? 1)}>
      {props.children}
    </ZIndexContext.Provider>
  );
}
