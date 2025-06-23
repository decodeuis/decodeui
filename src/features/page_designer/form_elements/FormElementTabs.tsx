import {
  createEffect,
  createSignal,
  For,
  Match,
  onMount,
  type ParentProps,
  Show,
  Switch,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { PlusIconButton } from "~/components/styled/buttons/PlusIconButton";
import { useToast } from "~/components/styled/modal/Toast";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { evalExpression } from "~/lib/expression_eval";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/data/fetchAndSetGraphData";
import { STYLES } from "~/pages/settings/constants";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { TabButton } from "../settings/TabButton";
import { ComponentList } from "./components/ComponentList";
import { openInNewInternalTab } from "./pages/functions/openInNewInternalTab";
import { PagesList } from "./pages/PagesList";
import { TabsContainer } from "./TabsContainer";
import { As } from "~/components/As";
import { Divider } from "../../../components/styled/Divider";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const UlContainer = (props: ParentProps) => (
  <As
    as="ul"
    css={[
      STYLES.overflowCss,
      `return \`._id {
  display: flex;
  gap: 5px;
  margin-bottom: -1px;
  flex-wrap: nowrap;
  list-style: none;
  padding: 0;
}\`;`,
    ]}
  >
    {props.children}
  </As>
);

type SectionHeaderProps = {
  title: string;
  onAddClick: () => void;
  icon?: string;
};

const SectionHeader = (props: SectionHeaderProps) => (
  <As
    as="div"
    css={[
      `return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: \${args.theme.var.color.background_light_150};
  padding: 4px 0;
}\`;`,
    ]}
  >
    <As
      as="div"
      css={[
        `return \`._id {
  padding: 6px;
  font-weight: 500;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 4px;
}\`;`,
      ]}
    >
      {props.icon && <Icon icon={props.icon} width="18" height="18" />}
      {props.title}
    </As>
    <PlusIconButton
      onClick={props.onAddClick}
      ariaLabel={`Add new ${props.title}`}
    />
  </As>
);

const PageLevelComponents = (props: Readonly<{ rootLevel?: boolean }>) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [rootVertexes, setRootVertexes] = createSignal<Vertex[]>([]);
  const { showWarningToast } = useToast();

  onMount(() => {
    if (props.rootLevel) {
      fetchAndSetGraphData(
        graph,
        setGraph,
        "g:'ALL_ROOT_LEVEL_COMPONENTS'<-'ParentComponent*'",
        undefined,
        { skipExisting: true },
      );
    }
  });
  createEffect(() => {
    if (props.rootLevel) {
      // Fetch children level Components
      const vertexes: Vertex[] =
        evalExpression("g:'Component'", {
          graph,
          setGraph,
          vertexes: [],
        }) || [];
      setRootVertexes(
        vertexes, //.filter((vertex) => !vertex.OUT?.ParentComponent || Object.keys(vertex.OUT.ParentComponent).length === 0) || [],
      );
    } else {
      // children level Components are already fetched when page is loaded.
      if (formStoreVertex()?.P?.formDataId) {
        setRootVertexes(
          evalExpression("<-ParentComponent", {
            graph,
            setGraph,
            vertexes: [graph.vertexes[formStoreVertex().P.formDataId]],
          }) || [],
        );
      } else {
        setRootVertexes([]);
      }
    }
  });

  const handleAddComponentClick = () => {
    if (!props.rootLevel && isNegative(formStoreVertex().P.formDataId)) {
      showWarningToast("Please Save Current Page first.");
      return;
    }

    return openInNewInternalTab(
      layoutStoreId,
      {
        id: "new",
        IN: {},
        L: ["Component"],
        OUT: {},
        P: {
          parentId: props.rootLevel ? null : formStoreVertex().P.formDataId,
        },
      } as Vertex,
      graph,
      setGraph,
    );
  };

  return (
    <>
      <SectionHeader
        title={props.rootLevel ? "Components" : "Page Components"}
        onAddClick={handleAddComponentClick}
        icon={props.rootLevel ? "ph:puzzle-piece" : "ph:layout"}
      />
      <ComponentList
        edgeName="ParentComponent"
        isFetchData={false}
        rootVertexes={rootVertexes()}
      />
    </>
  );
};

const TabList = (props: {
  tabs: Array<{ collection: string; title: string }>;
  selectedTab: { collection: string; title: string };
  onSelect: (tab: { collection: string; title: string }) => void;
}) => (
  <UlContainer>
    <For each={props.tabs}>
      {(data) => (
        <TabButton
          data={data.title}
          isSelected={props.selectedTab === data}
          onClick={() => props.onSelect(data)}
        />
      )}
    </For>
  </UlContainer>
);

export function FormElementTabs() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const leftMenuTabs = [
    { collection: "Comp", title: "Components" },
    { collection: "Page", title: "Pages" },
    // { collection: "EmailTemplate", title: "Email Template" },
  ];
  const [selectedTab, setSelectedTab] = createSignal(leftMenuTabs[0]);

  return (
    <As
      as="div"
      css={[
        `return \`._id {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
}\`;`,
      ]}
    >
      <As
        as="div"
        css={`return \`._id {
  background-color: \${args.theme.var.color.background_light_100};
  overflow-x: auto;
}\`;`}
      >
        <TabsContainer>
          <TabList
            tabs={leftMenuTabs}
            selectedTab={selectedTab()}
            onSelect={setSelectedTab}
          />
        </TabsContainer>
      </As>

      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
}\`;`,
        ]}
      >
        <Switch>
          <Match when={selectedTab().collection === "Comp"}>
            <ComponentList
              edgeName="ParentComp"
              rootExpression={`g:'Comp[Root]'`}
            />

            <Divider />

            {/* <Show keyed when={formStoreVertex()?.id}>
              <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                <PageLevelComponents rootLevel={false} />
              </DesignerFormIdContext.Provider>
            </Show>

            <Divider /> */}

            <As
              as="div"
              css={[
                `return \`._id {
  margin-top: 4px;
}\`;`,
              ]}
            >
              <Show keyed when={formStoreVertex()?.id}>
                <DesignerFormIdContext.Provider value={formStoreVertex().id}>
                  <PageLevelComponents rootLevel={true} />
                </DesignerFormIdContext.Provider>
              </Show>
            </As>
          </Match>
          <Match
            keyed
            when={PageDesignerLabels.find(
              (v) => v === selectedTab().collection,
            )}
          >
            <PagesList coll={selectedTab().collection} />
          </Match>
        </Switch>
      </As>
    </As>
  );
}
