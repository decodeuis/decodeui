import type { CellContext } from "@tanstack/solid-table";

import { For } from "solid-js";

import type { DataGridStore } from "~/features/grid/context/DataGridContext";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";

import { getSupportTicketFormSchema } from "./functions/supportTicketFormSchema";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function SupportTickets() {
  const [graph, setGraph] = useGraph();
  let gridStore: DataGridStore;

  const getTableData = async () => {
    return await postAPI(API.support.getTicketsUrl, {});
  };

  const SupportTicketSchema = {
    attributes: [
      {
        componentName: "SystemTextInput",
        displayName: "Name",
        key: "name",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Email",
        key: "email",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Subject",
        key: "subject",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Message",
        key: "message",
      },
      {
        collection: "->$0SupportStatus",
        componentName: "Select",
        displayName: "Status",
        key: "SupportStatus",
        labelKey: "::'P.name'",
      },
      {
        componentName: "SystemTextInput",
        displayName: "Created At",
        key: "createdAt",
      },
      {
        cell: (info: CellContext<Vertex, unknown>) => {
          const getReplies = () => {
            return evalExpression("<-ParentSupport", {
              graph: graph,
              setGraph: setGraph,
              vertexes: [graph.vertexes[info.row.original.id]],
            }).sort(
              (a: Vertex, b: Vertex) =>
                new Date(a.P.createdAt).getTime() -
                new Date(b.P.createdAt).getTime(),
            );
          };
          return (
            <div>
              <For each={getReplies()}>
                {(reply: Vertex) => (
                  <As
                    as="div"
                    css={`return \`._id {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}\`;`}
                  >
                    {new Date(reply.P.createdAt).toLocaleDateString()}{" "}
                    {new Date(reply.P.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {reply.P.message.slice(0, 10)}... (by{" "}
                    {reply.P.email.slice(0, 5)}...)
                  </As>
                )}
              </For>
            </div>
          );
        },
        componentName: "SystemTextInput",
        type: "textarea",
        displayName: "Replies",
        key: "replies",
      },
    ],
    isInlineEditable: true,
    key: "Support",
    title: "Support Tickets",
  };
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const editSchema = getSupportTicketFormSchema(onSuccess);
  return (
    <DataGrid
      // user should not create new support ticket himself, so we hide the add new button
      CustomAddNewButton={() => <div />}
      editSchema={editSchema}
      formSchema={SupportTicketSchema}
      getTableData={getTableData}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="Support"
    />
  );
}
