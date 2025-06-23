// import { Orb, OrbEventType } from '@memgraph/orb';
import { createEffect, createSignal, onCleanup, Show } from "solid-js";

import { useGraph } from "~/lib/graph/context/UseGraph";

interface GraphViewProps {
  edges: any[];
  nodes: any[];
}

// TODO: use https://github.com/Nhogs/popoto to generate cypher queries and graph view library both.
export function GraphView() {
  const GraphView = (props: Readonly<GraphViewProps>) => {
    const [json, setJson] = createSignal({});
    const mount = async (container: HTMLDivElement) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@memgraph/orb/dist/browser/orb.min.js";
      script.onload = () => {
        // const Orb = await import('@memgraph/orb/dist/index.js');
        // TODO: Dynamically import library only when required.
        // const nodes = [
        //   { id: 1, label: "Orb" },
        //   { id: 2, label: "Graph" },
        //   { id: 3, label: "Canvas" },
        // ];
        // const edges = [
        //   { id: 1, start: 1, end: 2, label: "DRAWS" },
        //   { id: 2, start: 2, end: 3, label: "ON" },
        // ];
        // First `Orb` is just a namespace of the JS package
        // @ts-ignore
        const orb = new Orb.Orb(container);

        // Initialize nodes and edges
        orb.data.setup({ edges: props.edges, nodes: props.nodes });
        // orb.data.setup({ nodes, edges });
        // Render and recenter the view
        orb.view.render(() => {
          orb.view.recenter();
        });

        // @ts-ignore
        orb.events.on(Orb.OrbEventType.NODE_CLICK, (event) => {
          setJson({ ...event.node.data });
        });
        // @ts-ignore
        orb.events.on(Orb.OrbEventType.EDGE_CLICK, (event) => {
          setJson({ ...event.edge.data });
        });
      };
      document.head.appendChild(script);
    };

    return (
      <>
        <div
          ref={(el) => {
            setTimeout(() => mount(el), 0);
            onCleanup(() => {
              el.replaceChildren();
            });
          }}
          style="border: 1px solid ${args.theme.var.color.border}; width: 1200px; height: 600px;"
        />
        <pre>{JSON.stringify(json())}</pre>
      </>
    );
  };

  const [graph, _setGraph] = useGraph();
  const [load, setLoad] = createSignal(false);
  createEffect(() => {
    if (graph.vertexes && graph.edges) {
      setLoad(false);
      setTimeout(() => setLoad(true), 0);
    }
  });
  return (
    <Show when={load()}>
      <GraphView
        edges={Object.entries(graph.edges)
          .filter(([_, edge]) => edge.T !== "Attr")
          .map(([_key, value]) => ({
            ...value,
            end: value.E,
            label: value.T,
            start: value.S,
          }))}
        nodes={Object.entries(graph.vertexes)
          .filter(([_, vertex]) => vertex.L[0] !== "Attr")
          .map(([_key, value]) => ({
            ...value,
            label: value.L[0],
          }))}
      />
    </Show>
  );
}
