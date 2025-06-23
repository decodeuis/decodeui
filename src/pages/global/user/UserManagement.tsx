import type { DataGridStore } from "~/features/grid/context/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { getUserFormSchema } from "./userFormSchema";

export function UserManagement() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.user.getUsersListUrl);
  };
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const UserSchema = {
    attributes: [
      {
        componentName: "SystemTextInput",
        displayName: "Username",
        key: "username",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Email",
        key: "email",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Name",
        key: "name",
      },
      {
        collection: "g:'Role'",
        componentName: "MultiSelect",
        key: "role",
      },
      {
        componentName: "Select",
        displayName: "Status",
        key: "status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    isInlineEditable: true,
    key: "User",
    title: "Users",
  };

  const addSchema = getUserFormSchema(onSuccess);
  const editSchema = getUserFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <SchemaRenderer form={addSchema} />}
      editSchema={editSchema}
      formSchema={UserSchema}
      getTableData={getTableData}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="User"
    />
  );
}
