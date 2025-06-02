"use server";

import { getAdjustedDimensions } from "@/lib/get-adjusted-dimentions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { z } from "zod";

let ratelimit: Ratelimit | undefined;

// Add rate limiting if Upstash API keys are set, otherwise skip
if (process.env.UPSTASH_REDIS_REST_URL) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // Allow 4 requests per day (~2-4 prompts), then need to use API key
    limiter: Ratelimit.fixedWindow(4, "1 d"),
    analytics: true,
    prefix: "easyedit",
  });
}

const schema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
  width: z.number(),
  height: z.number(),
  userAPIKey: z.string().optional(),
});

export async function generateImage(
  unsafeData: z.infer<typeof schema>,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { imageUrl, prompt, width, height, userAPIKey } =
    schema.parse(unsafeData);

  if (ratelimit && !userAPIKey) {
    const identifier = await getIPAddress();

    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return {
        success: false,
        error:
          "No requests left. Please add your own API key or try again in 24h.",
      };
    }
  }

  const adjustedDimensions = getAdjustedDimensions(width, height);

  try {
    const response = await fetch(
      "https://api.together.ai/v1/images/generations",
      {
        method: "post",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-kontext-max",
          // model: "black-forest-labs/FLUX.1-kontext-pro",
          steps: 28,
          prompt,
          width: adjustedDimensions.width,
          height: adjustedDimensions.height,
          image_url: imageUrl,
        }),
      },
    );

    const json = await response.json();
    console.log(json);
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

async function getIPAddress() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headersList.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}
