import type { DataGridStore } from "~/features/grid/context/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/general/getApi";

import { getEmailAuditFormSchema } from "./emailAuditFormSchema";

export function EmailAudit() {
  let gridStore: DataGridStore;
  const getTableData = async () => {
    return await getAPI(API.email.auditUrl);
  };

  const EmailAuditSchema = {
    attributes: [
      {
        componentName: "SystemTextInput",
        displayName: "From",
        key: "from",
      },
      {
        componentName: "SystemTextInput",
        displayName: "To",
        key: "to",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Subject",
        key: "subject",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Status",
        key: "status",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Sent At",
        key: "sentAt",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Message ID",
        key: "messageId",
      },
    ],
    isInlineEditable: true,
    key: "Email",
    title: "Email Audit Log",
  };

  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const editSchema = getEmailAuditFormSchema(onSuccess);

  return (
    <DataGrid
      CustomAddNewButton={() => <div />}
      editSchema={editSchema}
      formSchema={EmailAuditSchema}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="emails"
    />
  );
}
