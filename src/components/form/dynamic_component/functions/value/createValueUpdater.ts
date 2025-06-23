import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { useToast } from "~/components/styled/modal/Toast";
import { createMemo } from "solid-js";
import { ifNotNull } from "~/lib/data_structure/ifNotNull";
import { IdAttr } from "~/lib/graph/type/idAttr";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";

/**
 * Updates the value of a component in the graph
 */
export function createValueUpdater(
  props: {
    data?: Vertex;
    meta: Vertex;
    onChange?: (data: unknown) => void;
  },
  options: {
    formVertex: () => Vertex<FormStoreObject> | undefined;
    isNoPermissionCheck: () => boolean;
    hasCreatePermission: () => boolean | null | undefined;
    hasEditPermission: () => boolean | null | undefined;
  },
) {
  const [graph, setGraph] = useGraph();
  const [previewStore] = usePreviewContext();
  const { showErrorToast } = useToast();

  // Create the value memo
  const value = createMemo(() => {
    return ifNotNull(props.data?.P[props.meta.P[IdAttr]]);
  });

  // Update value function
  function updateValue(newValue: unknown) {
    // Check if the user has the appropriate permissions for the specific field
    /*if (!hasFieldPermission(props.meta.P.key)) {
      showErrorToast("You do not have permission to modify this field.");
      return;
      }*/

    // Check if the user has permission to update this value
    if (!options.isNoPermissionCheck()) {
      // Check for view-only mode
      if (previewStore?.isViewOnly) {
        showErrorToast("You do not have permission to modify this field.");
        return;
      }

      // Check for create/edit permissions
      if (!(options.hasCreatePermission() || options.hasEditPermission())) {
        showErrorToast("You do not have permission to set this value.");
        return;
      }

      // Check for create permission if setting an undefined value
      const existingValue = props.data?.P[props.meta.P.key];
      if (existingValue === undefined && !options.hasCreatePermission()) {
        showErrorToast("You do not have create permission to set this value.");
        return;
      }

      // Additional checks, e.g., role-based or context-sensitive permissions
      /*if (!hasRolePermission('editor') || !isOwnerOfData(props.data)) {
        showErrorToast("You do not have the necessary permissions to modify this data.");
        return;
      }*/
    }

    // Log the action for auditing purposes
    // logAction('modify', props.meta.P.key, value, currentUser);

    // TODO: if only create permission, and value is set dont display it.

    // Update the value if we have data
    if (props.data) {
      setValueGlobal(
        graph,
        setGraph,
        options.formVertex()?.P.txnId ?? 0,
        props.meta,
        props.data,
        newValue,
        false,
      );
    }
  }

  // onChange wrapper that respects the component's onChange prop
  const onChange = (value: unknown) => {
    if (props.onChange) {
      props.onChange(value);
    } else {
      updateValue(value);
    }
  };

  return {
    value,
    updateValue,
    onChange,
  };
}
