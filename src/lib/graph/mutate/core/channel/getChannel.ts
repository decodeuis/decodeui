import { BroadcastChannel } from "broadcast-channel";
import { channels } from "~/lib/graph/mutate/core/channel/channels";

export function getChannel(name: string): BroadcastChannel {
  if (!channels.has(name)) {
    channels.set(name, new BroadcastChannel(name));
  }
  return channels.get(name)!;
}
