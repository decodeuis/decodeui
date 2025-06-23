import type { CellContext } from "@tanstack/solid-table";

import type { DataGridStore } from "~/features/grid/context/DataGridContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DataGrid } from "~/features/grid/DataGrid";
import { API } from "~/lib/api/endpoints";

import { SchemaRenderer } from "../SchemaRenderer";
import { getSubDomainFormSchema } from "./functions/getSubDomainFormSchema";
import { As } from "~/components/As";
import { getSubDomains } from "~/routes/api/subdomain/getSubDomains";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface SubDomain {
  domain: string;
  key: string;
  name: string;
  description: string;
  recentActivities: Vertex<{
    action: string;
    details: string;
    timestamp: string;
  }>[];
}

export const SubDomainGrid = () => {
  // const [graph, setGraph] = useGraph();
  const getTableData = async () => {
    const data = (await getSubDomains()) as ServerResult;
    // data.result.map((subdomain: Vertex<SubDomain>) => {
    //   subdomain.P.activity = subdomain.P.recentActivities?.length > 0
    //     ? `${subdomain.P.recentActivities[0].P.action}`
    //     : "No activity";
    // });
    return data;
  };

  const getSubdomainUrl = (key: string) => {
    return `${API.auth.prepareAutoSignInUrl}?subdomain=${key}`;
  };

  const getDomainUrl = (domain: string) => {
    return `${API.auth.prepareAutoSignInUrl}?domain=${domain}`;
  };

  const SubDomain: IFormMetaData = {
    attributes: [
      {
        as: "span",
        cell: (info: CellContext<Vertex<SubDomain>, unknown>) => {
          return (
            <As
              as="a"
              css={`return \`._id {
  color: \${args.theme.var.color.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}\`;`}
              href={getSubdomainUrl(info.row.original.P.key)}
              rel="noreferrer"
              target="_blank"
            >
              {info.row.original.P.key}
            </As>
          );
        },
        componentName: "Html",
        displayName: "Subdomain",
        key: "key",
      },
      {
        as: "span",
        cell: (info: CellContext<Vertex<SubDomain>, unknown>) => {
          return (
            <As
              as="a"
              css={`return \`._id {
  color: \${args.theme.var.color.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}\`;`}
              href={getDomainUrl(info.row.original.P.domain)}
              rel="noreferrer"
              target="_blank"
            >
              {info.row.original.P.domain}
            </As>
          );
        },
        componentName: "Html",
        displayName: "Domain",
        key: "domain",
      },
      {
        as: "span",
        componentName: "Html",
        displayName: "Description",
        key: "description",
      },
      {
        as: "span",
        componentName: "Html",
        displayName: "Latest Activity",
        key: "activity",
      },
    ],
    isInlineEditable: true,
    key: "subdomains",
    title: "Subdomains",
  };

  let gridStore: DataGridStore;
  const onSuccess = () => {
    gridStore?.[0].fetchTableData();
  };

  const addSchema = getSubDomainFormSchema(onSuccess);
  const editSchema = getSubDomainFormSchema(onSuccess);
  return (
    <DataGrid
      CustomAddNewButton={() => <SchemaRenderer form={addSchema} />}
      editSchema={editSchema}
      formSchema={SubDomain}
      getTableData={getTableData}
      hideDeleteAction={true}
      hideEditJsonAction={true}
      initializeGridStoreParent={(gridStore_) => {
        gridStore = gridStore_;
      }}
      isShowPagination={true}
      tableId="subdomains"
    />
  );
};
