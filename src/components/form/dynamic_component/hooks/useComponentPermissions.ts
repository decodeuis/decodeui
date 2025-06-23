import { createLazyMemo } from "@solid-primitives/memo";
import { createMemo } from "solid-js";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getConfiguredPermissions } from "~/features/page_attr_render/getConfiguredPermissions";
import { hasPermissions } from "~/features/page_attr_render/hasPermissions";
import { PermissionLevel } from "~/features/page_attr_render/PermissionLevel";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useFormContext } from "~/components/form/context/FormContext";

export type PermissionsObject = {
  hasFullPermission: boolean | null | undefined;
  hasEditPermission: boolean | null | undefined;
  hasCreatePermission: boolean | null | undefined;
  hasViewPermission: boolean | null | undefined;
};

export function useComponentPermissions(props: {
  meta: Vertex;
  isNoPermissionCheck?: boolean | null;
}) {
  const [graph] = useGraph();
  const formId = useFormContext();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const [previewStore] = usePreviewContext();

  // Calculate configured permissions
  const allConfiguredPermission = createLazyMemo(() =>
    getConfiguredPermissions(
      getGlobalStore(graph).P.userRoles,
      props.meta,
      graph,
    ),
  );

  // Permission level checks
  const hasCreatePermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.CREATE) ??
      parentRenderContext()?.context?.hasCreatePermission ??
      (previewStore.hasEditPermission || previewStore.hasFullPermission)
    );
  });

  const hasEditPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.EDIT) ??
      parentRenderContext()?.context?.hasEditPermission ??
      previewStore.hasFullPermission
    );
  });

  const hasViewPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.VIEW) ??
      parentRenderContext()?.context?.hasViewPermission ??
      (previewStore.hasCreatePermission ||
        previewStore.hasEditPermission ||
        previewStore.hasFullPermission)
    );
  });

  const hasFullPermission = createLazyMemo(() => {
    return (
      hasPermissions(allConfiguredPermission(), PermissionLevel.FULL) ??
      parentRenderContext()?.context?.hasFullPermission ??
      previewStore.hasFullPermission
    );
  });

  // Check if permission check should be skipped
  const isNoPermissionCheck = () => {
    const vertex = formVertex();
    const formMetaId = vertex?.P.formMetaId;

    return (
      !previewStore ||
      props.isNoPermissionCheck ||
      (formMetaId
        ? graph.vertexes[formMetaId]?.P.isNoPermissionCheck
        : false) ||
      previewStore.isDesignMode ||
      previewStore.isNoPermissionCheck
    );
  };

  // Check if the user has any permission
  const hasPermission = () => {
    // If no permission check is needed, user has permissions
    if (isNoPermissionCheck()) {
      return true;
    }

    // Check if user has any valid permission level
    // Following the hierarchy: FULL > EDIT > CREATE > VIEW
    // Having a higher permission implicitly grants lower permissions
    return (
      hasFullPermission() ||
      hasEditPermission() ||
      hasCreatePermission() ||
      hasViewPermission()
    );
  };

  // Check if the component should be disabled based on permissions
  const isDisabledByPermissions = () => {
    if (isNoPermissionCheck()) {
      return undefined;
    }
    const permission = hasCreatePermission() || hasEditPermission();
    return permission ? undefined : true;
  };

  // Create a permissions object for component consumption
  const permissions = createMemo(() => {
    return {
      get hasFullPermission() {
        return hasFullPermission();
      },
      get hasEditPermission() {
        return hasEditPermission();
      },
      get hasCreatePermission() {
        return hasCreatePermission();
      },
      get hasViewPermission() {
        return hasViewPermission();
      },
    } as PermissionsObject;
  });

  return {
    hasCreatePermission,
    hasEditPermission,
    hasViewPermission,
    hasFullPermission,
    isNoPermissionCheck,
    hasPermission,
    isDisabledByPermissions,
    permissions,
    allConfiguredPermission,
  };
}
