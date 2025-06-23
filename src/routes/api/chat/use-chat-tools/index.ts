import type { APIEvent } from "@solidjs/start/server";

import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export const POST = async (event: APIEvent) => {
  const { messages } = await event.request.json();

  const result = streamText({
    messages,
    model: openai("gpt-4o-mini"),
    tools: {
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: "Ask the user for confirmation.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          "Get the user location. Always ask for confirmation before using this tool.",
        parameters: z.object({}),
      },
      // server-side tool with execute function:
      getWeatherInformation: {
        description: "show the weather in a given city to the user",
        execute: async ({ city }: { city: string }) => {
          // Add artificial delay of 2 seconds
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const weatherOptions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
        parameters: z.object({ city: z.string() }),
      },
    },
  });

  return result.toDataStreamResponse();
};
