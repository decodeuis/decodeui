import type { Id } from "~/lib/graph/type/id";
import type { ServerResult } from "~/cypher/types/ServerResult";

export interface PageViewWrapperProps {
  closePopUp?: (action?: string) => void;
  context?: Record<string, unknown>;
  dataId?: Id;
  dontConfirmExit?: boolean;
  expression?: string;
  formDataId?: Id;
  formId?: string;
  formMetaId?: Id;
  getFormData?: () => Promise<ServerResult>;
  hideSaveCancelButton?: boolean;
  initializeFormStoreParent?: (formStoreId: Id) => void;
  isDesignMode?: boolean;
  isNoPermissionCheck?: boolean;
  metaTxnId?: number;
  pageId?: string;
  pageKeyName?: string;
  pageVertexName?: string;
  parentId?: Id;
  txnId?: string;
  url?: string;
  uuid?: string;
}

export interface PageViewConstants {
  dataId?: Id;
  expression?: string;
  formDataId?: Id;
  formId?: string;
  formMetaId?: Id;
  getFormData: boolean;
  isDesignMode?: boolean;
  isNoPermissionCheck?: boolean;
  pageKeyName?: string;
  pageVertexName?: string;
  url?: string;
}

export interface MetaDataResult {
  formMetaId?: string;
  metaResult?: any;
  dataResult?: any;
  error?: string;
}
