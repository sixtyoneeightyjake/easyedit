"use server";

import { getAdjustedDimensions } from "@/lib/get-adjusted-dimentions";
import { getIPAddress, getRateLimiter } from "@/lib/rate-limiter";
import { z } from "zod";

const ratelimit = getRateLimiter();

const schema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
  width: z.number(),
  height: z.number(),
  userAPIKey: z.string().nullable(),
});

export async function generateImage(
  unsafeData: z.infer<typeof schema>,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { imageUrl, prompt, width, height, userAPIKey } =
    schema.parse(unsafeData);

  if (ratelimit && !userAPIKey) {
    const ipAddress = await getIPAddress();

    const { success } = await ratelimit.limit(ipAddress);
    if (!success) {
      return {
        success: false,
        error:
          "No requests left. Please add your own API key or try again in 24h.",
      };
    }
  }

  const apiKey = userAPIKey ?? process.env.TOGETHER_API_KEY;

  const adjustedDimensions = getAdjustedDimensions(width, height);

  try {
    const response = await fetch(
      "https://api.together.ai/v1/images/generations",
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // model: "black-forest-labs/FLUX.1-kontext-max",
          model: "black-forest-labs/FLUX.1-kontext-pro",
          steps: 28,
          prompt,
          width: adjustedDimensions.width,
          height: adjustedDimensions.height,
          image_url: imageUrl,
        }),
      },
    );

    const json = await response.json();
    const url = json.data[0].url;

    if (url) {
      return { success: true, url };
    } else {
      return {
        success: false,
        error: "Image could not be generated. Please try again.",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Image could not be generated. Please try again.",
    };
  }
}
