import type { Owner } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { GraphData, ServerResult } from "~/cypher/types/ServerResult";
import type {
  PageRenderObject,
  PageRenderStore,
} from "~/features/page_attr_render/context/PageRenderContext";
import type { UpdateOptions } from "~/lib/graph/mutate/core/setGraphData";

import type { FormStoreObject } from "../context/FormContext";

import type { ThemeContext, ColorMode } from "~/lib/styles/types/types";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export interface FunctionArgumentBaseType {
  clearAllErrors: () => void;
  componentName: string;
  createSignal: any; // solid-js function: import { createSignal } from "solid-js";
  createStore: any; // solid-js function: import { createStore } from "solid-js/store";
  data: Vertex;
  contextData: Record<string | symbol, unknown>;
  deleteTxnIdAndCreateNew: (txnId: number) => number;
  ensureData: () => null | string;
  error: (key?: string) => string | undefined;
  evalExpression: (expression: string, options: object) => unknown;
  fns: Record<string, ((...args: unknown[]) => unknown) | undefined>;
  graph: GraphInterface;
  hasFullPermission: boolean | null | undefined;
  hasEditPermission: boolean | null | undefined;
  hasCreatePermission: boolean | null | undefined;
  hasViewPermission: boolean | null | undefined;
  isNoPermissionCheck: boolean | null | undefined;
  isViewMode: boolean | null | undefined;
  // formInitialValues: FormStoreObject;
  // formValueStore: FormStoreObject;
  meta: Vertex;
  mounted: () => boolean;
  navigate: (
    to: string,
    options?: { replace?: boolean; scroll?: boolean; state?: any },
  ) => void;
  location: {
    pathname: string;
    search: string;
    hash: string;
    query: Record<string, string | string[]>;
    state: Readonly<Partial<unknown>> | null;
    key: string;
  };
  onChange: (value: unknown) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  parentRenderContext: PageRenderObject;
  ref: () => HTMLElement | null;
  setRef: (ref: HTMLElement | null) => void;
  removeTxnIdAndCreateNew: (txnId: number) => number;
  revertTransaction: (txnId: number) => void;
  revertTransactionUpToIndex: (txnId: number, txnIndex: number) => void;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  // setFormValueStore: SetStoreFunction<FormStoreObject>;
  // updateFormValueStore: (data: any, setDirtyFlag?: boolean) => void;
  searchParams?: Record<string, string | undefined>;
  setError: (error: string | undefined, key?: string) => void;
  setGraph: SetStoreFunction<GraphInterface>;
  setGraphData: (
    txnId: number,
    args: GraphData,
    options: UpdateOptions,
  ) => void;
  setSearchParams?: (
    params: Record<string, string | undefined | null>,
    options?: { replace?: boolean },
  ) => void;
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  theme: ThemeContext;
  txnId: number;
  updateValue: (value: unknown) => void;
  mergeVertexProperties: (
    txnId: number,
    vertexId: string,
    graph: GraphInterface,
    setGraph: SetStoreFunction<GraphInterface>,
    data: Record<string, unknown>,
  ) => void;
  zIndex: number;
  // Theme toggle functions
  toggleTheme: () => void;
  setColorMode: (mode: ColorMode) => void;
  resetTheme: () => void;
  currentMode: () => ColorMode;
  // User settings
  userSetting: Record<string, unknown> | undefined;
  saveUserSetting: (settings: Record<string, unknown>) => void;
  // Server function execution
  executeServerFunction: (request: {functionBody: string; contextData?: any}, context?: Record<string, unknown>) => Promise<ServerResult>;
  executeNamedServerFunction: (request: {functionName: string; contextData?: any}, context?: Record<string, unknown>) => Promise<ServerResult>;
}

export interface FunctionArgumentType extends FunctionArgumentBaseType {
  // parentValue: any;
  // projections: (number | string)[];
  value: unknown;
}

export interface RegexValidation {
  enabled: boolean;
  message: string;
  value: string;
}

export type RequiredFnType =
  | ((formStore: FormStoreObject) => boolean)
  | boolean;
