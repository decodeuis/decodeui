import type { SetStoreFunction } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import { InitialPermissions } from "~/features/page_attr_render/InitialPermissions";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export type FormStoreObject = ReturnType<typeof getInitialFormStore>;

export function getInitialFormStore(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  return {
    ...InitialPermissions,
    componentValue: null as Id | null,
    count: 1,
    discardPopup: false,
    error: undefined as string | undefined,
    formDataId: undefined as unknown as string,
    // formMetaData: null as IFormMetaData | null,
    formMetaId: undefined as unknown as string,
    hiddenNodes: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    id: undefined as string | undefined,
    isFetching: false,
    mounted: false,
    multiHighlight: [] as Array<Id | number>,
    openedViews: [] as Id[],
    selectedId: -1 as Id | number,
    selectedIndex: -1 as number,
    showAllJsonEditors: false,
    // check if at least one form in the layout tree when deleting a layout item, it display a dialog
    shouldContainAtLeastOneForm: false,
    txnId: generateNewTxnId(graph, setGraph),
    usedAttrsInNameKeys: [] as Array<Id | number>,
    usedAttrsInUniqueConstraints: [] as Array<Id | number>,
    lastAddedViewId: null as Id | null,
  };
}

export const FormContext = createContext<Id>();

export function useFormContext() {
  return useContext(FormContext);
}
