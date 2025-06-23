import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import { PermissionLevel } from "~/features/page_attr_render/PermissionLevel";
import { getConfiguredPermissions } from "~/features/page_attr_render/getConfiguredPermissions";
import { hasPermissions } from "~/features/page_attr_render/hasPermissions";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Id } from "~/lib/graph/type/id";
import type { PreviewStoreObject } from "~/features/page_designer/context/PreviewContext";
import type { PageViewWrapperProps } from "~/pages/PageViewWrapper/types";

interface UsePermissionsOptions {
  graph: GraphInterface;
  metaVertex: () => Vertex | undefined;
  isNoPermissionCheck: () => boolean;
  id: () => Id | undefined;
  previewStore: PreviewStoreObject;
}

export function usePermissions(
  props: Readonly<PageViewWrapperProps>,
  options: UsePermissionsOptions,
) {
  const getDynamicFns = () => {
    try {
      const evaluateFns = (
        fns:
          | ((args: FunctionArgumentType) => Record<string, unknown>)
          | string
          | undefined
          | null,
      ) => {
        if (typeof fns === "function") {
          return fns({} as FunctionArgumentType) || {};
        }
        if (typeof fns === "string") {
          try {
            return new Function("args", fns)({} as FunctionArgumentType) || {};
          } catch (error) {
            console.error("Error evaluating fns:", error);
            return {};
          }
        }
        return {};
      };

      return evaluateFns(options.metaVertex()?.P.fns);
    } catch (error) {
      console.error("Error in dynamicFns:", error);
      return {};
    }
  };

  const allConfiguredPermission = () =>
    getConfiguredPermissions(
      getGlobalStore(options.graph).P.userRoles,
      options.metaVertex()!,
      options.graph,
    );

  function checkPermission(level: PermissionLevel) {
    if (options.isNoPermissionCheck()) {
      return true;
    }

    if (level === PermissionLevel.CREATE && !options.id()) {
      return hasPermissions(allConfiguredPermission(), level);
    }

    if (options.id()) {
      return hasPermissions(allConfiguredPermission(), level);
    }

    return false;
  }

  const permissions = {
    full: () => checkPermission(PermissionLevel.FULL),
    edit: () => checkPermission(PermissionLevel.EDIT),
    create: () => checkPermission(PermissionLevel.CREATE),
    view: () => checkPermission(PermissionLevel.VIEW),
    none: () => checkPermission(PermissionLevel.NONE),
  };

  const checkAuthError = () => {
    if (options.id() && !(permissions.edit() || permissions.view())) {
      return `You are not authorized to edit or view ${props.pageVertexName}`;
    }
    if (!(options.id() || permissions.create())) {
      return `You are not authorized to create ${props.pageVertexName}`;
    }
    return "";
  };

  return {
    permissions,
    checkAuthError,
    getDynamicFns,
    allConfiguredPermission,
  };
}
