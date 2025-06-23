import { onCleanup, onMount } from "solid-js";

import { useDesignerLayoutStore } from "../context/LayoutContext";
import { getChannel } from "~/lib/graph/mutate/core/channel/getChannel";
import { handleChannelMessage } from "~/lib/graph/mutate/core/channel/handleChannelMessage";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const IFramePreview = (props: {
  formStoreId: string;
  noMinHeight?: boolean;
}) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    const channel = getChannel(props.formStoreId);
    channel.onmessage = (msg) =>
      handleChannelMessage(
        msg,
        graph,
        setGraph,
        props.formStoreId,
        undefined,
        true,
      );
    channel.postMessage(
      JSON.stringify({ graph: { ...graph, broadcastChannels: [] } }),
    );
  };

  setGraph("broadcastChannels", (channels) =>
    channels.includes(props.formStoreId)
      ? channels
      : [...channels, props.formStoreId],
  );

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) =>
      channels.filter((id) => id !== props.formStoreId),
    );
  });

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "LOADED") {
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
      name={props.formStoreId}
      src={`${window.location.origin}/internal/PageDesignPreview?layoutStoreId=${layoutStoreId}&formStoreId=${props.formStoreId}${props.noMinHeight ? "&noMinHeight=true" : ""}`}
      style={{ border: "none", height: "100%", width: "100%" }}
    />
  );
};
