import type { Vertex } from "~/lib/graph/type/vertex";
import {
  type Accessor,
  type Component,
  type Owner,
  createSignal,
} from "solid-js";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { SetStoreFunction } from "solid-js/store";
import { createStore } from "solid-js/store";
import type { ThemeContext, ColorMode } from "~/lib/styles/types/types";
import type { Navigator, useSearchParams } from "@solidjs/router";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import { deleteTxnIdAndCreateNew } from "~/components/form/functions/deleteTxnIdAndCreateNew";
import { ensureData } from "~/components/form/functions/ensureData";
import { evalExpression } from "~/lib/expression_eval";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { removeTxnIdAndCreateNew } from "~/components/form/functions/removeTxnIdAndCreateNew";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { setError } from "~/components/form/functions/setError";
import { setGraphDataWithTransaction } from "~/lib/graph/mutate/core/setGraphDataWithTransaction";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { runWithOwnerFunction } from "~/components/form/dynamic_component/owner/runWithOwnerFunction";
import { runWithParentOwnerFunction } from "~/components/form/dynamic_component/owner/runWithParentOwnerFunction";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
interface ToastFunctions {
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
}

interface ThemeToggleFunctions {
  toggleTheme: () => void;
  setColorMode: (mode: ColorMode) => void;
  resetTheme: () => void;
  currentMode: () => ColorMode;
}

/**
 * Create the base function arguments for dynamic components
 */
export function createFunctionArgumentBase(
  props: {
    data?: Vertex;
    meta: Vertex;
  },
  options: {
    formVertex: () => Vertex<FormStoreObject> | undefined;
    formId?: string;
    componentName: Accessor<string | Component | undefined>;
    isNoPermissionCheck: () => boolean;
    isViewMode: () => boolean | undefined;
    isReadOnly: () => boolean | undefined;
    mounted: () => boolean;
    parentMeta: () => Vertex | undefined;
    ref: () => HTMLElement | null;
    setRef: (ref: HTMLElement | null) => void;
    updateValue: (value: unknown) => void;
    onChange: (value: unknown) => void;
    hasFullPermission: Accessor<boolean | null | undefined>;
    hasEditPermission: Accessor<boolean | null | undefined>;
    hasCreatePermission: Accessor<boolean | null | undefined>;
    hasViewPermission: Accessor<boolean | null | undefined>;
  },
  hooks: {
    graph: GraphInterface;
    setGraph: SetStoreFunction<GraphInterface>;
    toast: ToastFunctions;
    searchParams: ReturnType<typeof useSearchParams>[0];
    setSearchParams: ReturnType<typeof useSearchParams>[1];
    zIndex: number;
    navigate: Navigator;
    location: {
      pathname: string;
      search: string;
      hash: string;
      query: Record<string, string | string[]>;
      state: Readonly<Partial<unknown>> | null;
      key: string;
    };
    theme: ThemeContext;
    parentItems: [{ context: FunctionArgumentType }, unknown][];
    previewStore: { context: unknown };
    themeToggle: ThemeToggleFunctions;
    owner: Owner;
    parentRenderContext: () => { context: FunctionArgumentType } | undefined;
    functionProxy: Record<string, unknown>;
  },
) {
  return {
    clearAllErrors: () => {
      const errorVertexId = `${props.data?.id}-error`;
      replaceVertexProperties(
        0,
        errorVertexId,
        hooks.graph,
        hooks.setGraph,
        {},
      );
    },
    get componentName() {
      return options.componentName();
    },
    get context() {
      return hooks.previewStore.context;
    },
    get data() {
      return props.data;
    },
    get contextData() {
      return runWithOwnerFunction(hooks.owner, () => useDataContext() || {});
    },
    deleteTxnIdAndCreateNew: (txnId: number) => {
      return deleteTxnIdAndCreateNew(
        txnId,
        options.formId!,
        hooks.graph,
        hooks.setGraph,
      );
    },
    // on create save dataVertex is changed, so it's not available. so this will create new dataVertex again.
    ensureData: () => {
      return ensureData(
        props.data?.id,
        options.formId!,
        options.formVertex,
        hooks.graph,
        hooks.setGraph,
      );
    },
    error: (key?: string) => {
      const errorVertexId = `${props.data?.id}-error`;
      return hooks.graph.vertexes[errorVertexId]?.P[key ?? props.meta.P.key];
    },
    evalExpression,
    mergeVertexProperties,
    get fns() {
      return hooks.functionProxy;
    },
    formId: options.formId,
    get graph() {
      return hooks.graph;
    },
    get hasFullPermission() {
      return options.hasFullPermission();
    },
    get hasEditPermission() {
      return options.hasEditPermission();
    },
    get hasCreatePermission() {
      return options.hasCreatePermission();
    },
    get hasViewPermission() {
      return options.hasViewPermission();
    },
    get isNoPermissionCheck() {
      return options.isNoPermissionCheck();
    },
    get isViewMode() {
      return options.isViewMode();
    },
    get meta() {
      return props.meta;
    },
    mounted: options.mounted,
    navigate: hooks.navigate,
    location: hooks.location,
    onChange: options.onChange,
    owner: hooks.owner,
    parentItems: hooks.parentItems,
    get parentMeta() {
      return options.parentMeta();
    },
    parentRenderContext: hooks.parentRenderContext(),
    get readOnly() {
      return options.isReadOnly();
    },
    theme: hooks.theme,
    ref: options.ref,
    setRef: options.setRef,
    removeTxnIdAndCreateNew: (txnId: number) => {
      return removeTxnIdAndCreateNew(
        txnId,
        options.formId!,
        hooks.graph,
        hooks.setGraph,
      );
    },
    revertTransaction: (txnId: number) =>
      revertTransaction(txnId, hooks.graph, hooks.setGraph),
    revertTransactionUpToIndex: (txnId: number, txnIndex: number) =>
      revertTransactionUpToIndex(txnId, txnIndex, hooks.graph, hooks.setGraph),
    runWithOwner: (fn: () => void) => runWithOwnerFunction(hooks.owner, fn),
    runWithParentOwner: (fn: () => void) =>
      runWithParentOwnerFunction(hooks.parentRenderContext, fn),
    searchParams: hooks.searchParams,
    setError: (error: string | undefined, key?: string) => {
      const errorVertexId = `${props.data?.id}-error`;
      setError(
        errorVertexId,
        key ?? props.meta.P.key,
        error,
        hooks.graph,
        hooks.setGraph,
      );
    },
    get setGraph() {
      return hooks.setGraph;
    },
    setGraphData: (
      txnId: number,
      args: Parameters<typeof setGraphDataWithTransaction>[3],
      options: Parameters<typeof setGraphDataWithTransaction>[4],
    ) => {
      setGraphDataWithTransaction(
        txnId,
        hooks.graph,
        hooks.setGraph,
        args,
        options,
      );
    },
    setSearchParams: hooks.setSearchParams,
    showErrorToast: hooks.toast.showErrorToast,
    showSuccessToast: hooks.toast.showSuccessToast,
    showWarningToast: hooks.toast.showWarningToast,
    get txnId() {
      return options.formVertex()?.P.txnId ?? 0;
    },
    updateValue: options.updateValue,
    zIndex: hooks.zIndex,
    createSignal,
    createStore,
    // Theme toggle functions from useThemeToggle hook
    toggleTheme: hooks.themeToggle.toggleTheme,
    setColorMode: hooks.themeToggle.setColorMode,
    resetTheme: hooks.themeToggle.resetTheme,
    currentMode: hooks.themeToggle.currentMode,
    // User settings getter and setter
    get userSetting() {
      const userSettingId = getGlobalStore(hooks.graph).P.userSettingId;
      return userSettingId ? hooks.graph.vertexes[userSettingId]?.P : undefined;
    },
    saveUserSetting: (settings: Record<string, unknown>) => {
      return saveUserSetting(settings, hooks.graph, hooks.setGraph);
    },
  } as Omit<FunctionArgumentType, "parentValue" | "projections" | "value">;
}
