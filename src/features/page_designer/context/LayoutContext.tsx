import { createContext, useContext } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface OpenFormInfo {
  dataId: Id;
  formDataId?: Id;
  formId: Id;
  label: string;
  mainPanel: Id;
  parentId?: Id;
  txnId: Id;
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;

export const INITIAL_WIDTHS = {
  bottom: 300,
  left: 190,
  right0: 305,
  right1: 305,
  right2: 310,
} as const;

export function getInitialLayoutSettings() {
  return {
    isLeftOpen: true,
    isRight0Open: false,
    isRight1Open: true,
    isRight2Open: true,
    leftWidth: INITIAL_WIDTHS.left,
    rightWidth0: INITIAL_WIDTHS.right0,
    rightWidth1: INITIAL_WIDTHS.right1,
    rightWidth2: INITIAL_WIDTHS.right2,
  };
}

export function getInitialDesignerLayoutStore() {
  const mainPanel = uuidv7();
  return {
    [`mainPanel${mainPanel}Tab` as `mainPanel${string}Tab`]: null as Id | null,
    [`mainPanel${mainPanel}Width` as `mainPanel${string}Width`]: "1fr",
    activeItem: null as Id | null | number,
    bottomHeight: INITIAL_WIDTHS.bottom,
    copiedItem: null as Vertex | null,
    draggedTab: null as Id | null,
    draggedVertexIds: [] as Id[],
    formId: null as Id | null,
    id: uuidv7(),
    ...getInitialLayoutSettings(),
    isSmallScreen: false,
    mainFormId: null as Id | null,
    mainPanel: [mainPanel],
    openedFormIds: [] as Id[],
    dragPosition: null as
      | "after"
      | "before"
      | "center"
      | "left"
      | "right"
      | null,
  };
}

export const DesignerLayoutStoreContext = createContext<Id>();
export const DesignerFormIdContext = createContext<Id>();

export function useDesignerFormIdContext() {
  return useContext(DesignerFormIdContext);
}

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}
