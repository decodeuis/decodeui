import { createAsync, query, useNavigate } from "@solidjs/router";
import { Match, type ParentProps, Show, Switch } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import { handleUserNavigation } from "~/lib/graph/mutate/user/loadUser";

import { setUserData } from "~/lib/graph/mutate/user/setUserData";

import { getInitialData } from "./cypher/get/getInitialData";
import { getGlobalStore } from "./lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "./lib/graph/mutate/core/setGraphData";
import { getUserRPC } from "./routes/api/auth/(user)/getUserRPC";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { SimpleErrorMessage } from "~/components/SimpleErrorMessage";

interface GetInitialDataProps extends ParentProps {
  dontRedirectToLogin?: boolean;
}

const fetchData = query(async () => {
  "use server";
  const [initialData, userData] = await Promise.all([
    getInitialData().catch(
      (error): ServerResult => ({
        error: error.message || "Failed to connect to database",
        graph: undefined,
      }),
    ),
    // authenticate ?
    getUserRPC().catch(() => null),
    // : Promise.resolve(null),
  ]);
  return { initialData, userData };
}, "initialData");

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const navigate = useNavigate();

  const setData = (initialData: ServerResult, userData: null | UserData) => {
    if (initialData.error) {
      mergeVertexProperties<GlobalProperties>(
        0,
        "globalStoreId",
        graph[0],
        graph[1],
        {
          initialDataFetchError: `Failed to load initial data: ${initialData.error}`,
        },
      );
      return;
    }

    setGraphData(graph[0], graph[1], initialData.graph!);

    // Store subdomain and domain in global store and load website schemas
    if (initialData.subdomain) {
      mergeVertexProperties<GlobalProperties>(
        0,
        "globalStoreId",
        graph[0],
        graph[1],
        {
          subdomain: initialData.subdomain,
          domain: initialData.domain || undefined,
        },
      );

      // In Development Remove comment
      // Load website schemas based on subdomain
      // loadWebsiteSchemasForSubdomain(
      //   graph[0],
      //   graph[1],
      //   initialData.subdomain,
      //   initialData.domain || undefined,
      // );
    }

    if (userData) {
      setUserData(graph[0], graph[1], userData);
      handleUserNavigation(
        userData,
        props.dontRedirectToLogin ? undefined : navigate,
      );
    }
  };

  const data = createAsync(
    async () => {
      return await fetchData();
    },
    { deferStream: true },
  );

  const RenderContent = () => {
    setData(data()!.initialData, data()!.userData as UserData);
    return (
      <Switch>
        <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
          <SimpleErrorMessage
            message={getGlobalStore(graph[0]).P.initialDataFetchError}
          />
        </Match>
        <Match when={!getGlobalStore(graph[0]).P.initialDataFetchError}>
          {props.children}
        </Match>
      </Switch>
    );
  };

  return (
    <Show when={data()}>
      <RenderContent />
    </Show>
  );
}
