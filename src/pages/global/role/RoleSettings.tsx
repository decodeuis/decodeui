import type { DataGridStore } from "~/features/grid/context/DataGridContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";

import { SchemaRenderer } from "../../SchemaRenderer";
import { getRoleFormSchema } from "./functions/formSchema";

export function RoleSettings() {
  let gridStore: DataGridStore;
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };
  const getTableData = async () => {
    return await getAPI(API.role.getRolesUrl);
  };

  const RoleSchema = {
    attributes: [
      {
        as: "span",
        componentName: "Html",
        displayName: "Name",
        key: "key",
      },
      {
        as: "span",
        componentName: "Html",
        displayName: "Description",
        key: "description",
      },
    ],
    isInlineEditable: true,
    key: "Role",
    title: "Roles",
  } as IFormMetaData;

  const addSchema = getRoleFormSchema(onSuccess);
  const editSchema = getRoleFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <SchemaRenderer form={addSchema} />}
      editSchema={editSchema}
      formSchema={RoleSchema}
      getTableData={getTableData}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="Role"
    />
  );
}
