import { onCleanup, onMount } from "solid-js";

import type { Vertex } from "~/lib/graph/type/vertex";
import { getChannel } from "~/lib/graph/mutate/core/channel/getChannel";
// import { handleChannelMessage } from "~/lib/graph/mutate/core/channel/handleChannelMessage";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PreviewIsolated(props: { item: Vertex }) {
  const [graph, setGraph] = useGraph();
  const channelId = `preview-isolated-${props.item.id}`;
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    const channel = getChannel(channelId);
    // we don't need to handle channel messages here because we not want to update the graph
    // channel.onmessage = (msg) =>
    //   handleChannelMessage(
    //     msg,
    //     graph,
    //     setGraph,
    //     channelId,
    //     undefined,
    //     true,
    //   );
    // Send initial graph data and item info
    channel.postMessage(
      JSON.stringify({
        graph: { ...graph, broadcastChannels: [] },
        item: {
          id: props.item.id,
          pageVertexName: props.item.L[0],
          formMetaId: props.item.id.toString().startsWith("-")
            ? props.item.id
            : undefined,
        },
      }),
    );
  };

  setGraph("broadcastChannels", (channels) =>
    channels.includes(channelId) ? channels : [...channels, channelId],
  );

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) =>
      channels.filter((id) => id !== channelId),
    );
  });

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "LOADED" && event.data.channelId === channelId) {
        onLoad();
      }
    };

    window.addEventListener("message", handleMessage);

    onCleanup(() => {
      window.removeEventListener("message", handleMessage);
    });
  });

  return (
    <iframe
      allow="clipboard-read; clipboard-write"
      name={channelId}
      src={`${window.location.origin}/internal/PageDesignPreview?mode=isolated&channelId=${encodeURIComponent(channelId)}&layoutStoreId=${layoutStoreId}`}
      style={{ border: "none", height: "100%", width: "100%" }}
    />
  );
}
