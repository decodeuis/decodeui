import {
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  Suspense,
  Switch,
  Show,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/modal/Toast";
import { getTreeDataAPICall } from "~/cypher/get/getTreeDataAPICall";
import { SearchBar } from "~/components/styled/SearchBar";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { STYLES } from "~/pages/settings/constants";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { getTreeData, type NavItem } from "../functions/getTreeData";
import { PageItem } from "./PageItem";
import { As } from "~/components/As";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PagesList(props: Readonly<{ coll: string }>) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<NavItem[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // Fetch data function
  async function fetchData(): Promise<{
    data?: any;
    error?: string;
    graph?: any;
  }> {
    try {
      const data = await getTreeDataAPICall({
        collection: `g:'${props.coll}'`,
      });
      return { data: data, graph: data.graph };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Create a resource for data fetching
  const [data] = createResource(fetchData);

  // Create effect to handle data changes
  createEffect(() => {
    setIsFetchingData(true);
    if (data()) {
      const result = data();
      if (result?.error) {
        showErrorToast(result.error);
      } else if (result?.graph) {
        if (result.graph.vertexes[formStoreVertex()?.P.formDataId!]) {
          delete result.graph.vertexes[formStoreVertex()?.P.formDataId!];
        }
        setGraphData(graph, setGraph, result.graph, { skipExisting: true });

        const data2 = getTreeData(graph, setGraph, {
          collection: `g:'${props.coll}'`,
        }).filter((item) => item.id !== formStoreVertex()?.P.formDataId!);
        originalData = data2;
        setFilteredData(data2);
        setIsFetchingData(false);
      }
    }
  });

  // Update filtered data based on search query
  const updateFilteredData = () => {
    if (searchQuery()) {
      const filtered = originalData.filter((item) =>
        item.key?.toLowerCase().includes(searchQuery().toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(originalData);
    }
  };

  return (
    <Suspense fallback={<LoaderNew loaderHeight="55vh" />}>
      <Switch>
        <Match when={data.error}>Error: {data.error}</Match>
        <Match when={!isFetchingData()}>
          <>
            <Show when={filteredData().length >= 5}>
              <SearchBar
                handleChange={(value) => {
                  setSearchQuery(value);
                  updateFilteredData();
                }}
                placeholder={`Search ${props.coll}...`}
                value={searchQuery()}
              />
            </Show>
            <As
              as="div"
              css={[
                STYLES.overflowCss,
                `return \`._id {
  display: grid;
}\`;`,
              ]}
            >
              <For
                each={filteredData()}
                //                 fallback={
                //                   <As
                //                     as="div"
                //                     css={`return \`._id {
                //   margin: 20px 0px;
                //   padding: 3px;
                //   text-align: center;
                // }\`;`}
                //                   >
                //                     No {props.coll !== "Page" ? props.coll.replace(/Page$/, '') : props.coll} Found!
                //                   </As>
                //                 }
              >
                {(item) => (
                  <PageItem
                    child={item}
                    previewPageId={previewPageId()}
                    setPreviewPageId={setPreviewPageId}
                  />
                )}
              </For>
            </As>
          </>
        </Match>
      </Switch>
    </Suspense>
  );
}
