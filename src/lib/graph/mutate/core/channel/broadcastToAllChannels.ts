import { getChannel } from "~/lib/graph/mutate/core/channel/getChannel";

export function broadcastToAllChannels(
  channels: string[],
  skipChannel: string,
  message: any,
) {
  const messageString = JSON.stringify(message);
  for (const channelName of channels) {
    if (channelName !== skipChannel) {
      const channel = getChannel(channelName);
      channel.postMessage(messageString);
    }
  }
}
