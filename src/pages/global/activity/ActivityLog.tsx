import type { DataGridStore } from "~/features/grid/context/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";

import { getActivityLogFormSchema } from "./functions/getActivityLogFormSchema";

export function ActivityLog() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.settings.activity.getUrl);
  };

  const ActivityLogSchema = {
    attributes: [
      {
        componentName: "SystemTextInput",
        displayName: "Action",
        key: "action",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Entity Type",
        key: "entityType",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Entity ID",
        key: "entityId",
      },
      {
        componentName: "SystemTextInput",
        displayName: "User",
        key: "user",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Description",
        key: "description",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Created At",
        key: "createdAt",
      },
    ],
    isInlineEditable: true,
    key: "ActivityLog",
    title: "Activity Log",
  };

  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const _addSchema = getActivityLogFormSchema(onSuccess);
  const editSchema = getActivityLogFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <div />}
      editSchema={editSchema}
      formSchema={ActivityLogSchema}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="ActivityLog"
    />
  );
}
