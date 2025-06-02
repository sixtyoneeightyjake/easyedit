"use server";

import { Ratelimit } from "@upstash/ratelimit";
// import Together from "together-ai";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { fal } from "@fal-ai/client";

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

export async function generateImage({
  imageUrl,
  prompt,
  width,
  height,
  userAPIKey,
}: {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
  userAPIKey?: string;
}): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  // TODO: Validate params
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

  /*
    Trying kontext on Together - Not working
  */
  // const response = await fetch(
  //   "https://api.together.ai/v1/images/generations",
  //   {
  //     method: "post",
  //     headers: {
  //       Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       model: "black-forest-labs/FLUX.1-kontext-max",
  //       // model: "black-forest-labs/FLUX.1-kontext-pro",
  //       // max_tokens: 32,
  //       steps: 28,
  //       prompt,
  //       // width: adjustedDimensions.width,
  //       // height: adjustedDimensions.height,
  //       image_url: imageUrl,
  //       // input_image: imageUrl,
  //       aspect_ratio: "match_input_image",
  //       // messages: [
  //       //   {
  //       //     role: "user",
  //       //     content: [
  //       //       { type: "text", text: prompt },
  //       //       { type: "image_url", image_url: { url: imageUrl } },
  //       //     ],
  //       //   },
  //       // ],
  //     }),
  //   },
  // );

  // const json = await response.json();
  // return json.data[0].url;

  /*
    FAL

  */

  console.log(1);
  const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      prompt,
      image_url: imageUrl,
      width: adjustedDimensions.width,
      height: adjustedDimensions.height,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  console.log(2);

  const url = result.data.images[0].url;

  if (url) {
    return { success: true, url };
  } else {
    return { success: false, error: "Image could not be generated" };
  }

  /*
    Together Depth for WIP
  */
  // const together = new Together();

  // const response = await together.images.create({
  //   // TODO: Update to the new model
  //   model: "black-forest-labs/FLUX.1-depth",
  //   width: adjustedDimensions.width,
  //   height: adjustedDimensions.height,
  //   steps: 28,
  //   prompt,
  //   image_url: imageUrl,
  // });

  // const url = response.data[0].url;

  // if (url) {
  //   return { success: true, url };
  // } else {
  //   return { success: false, error: "Image could not be generated" };
  // }
}

function getAdjustedDimensions(
  width: number,
  height: number,
): { width: number; height: number } {
  const maxDim = 1024;
  const minDim = 64;

  const roundToMultipleOf16 = (n: number) => Math.round(n / 16) * 16;

  const aspectRatio = width / height;

  let scaledWidth = width;
  let scaledHeight = height;

  if (width > maxDim || height > maxDim) {
    if (aspectRatio >= 1) {
      scaledWidth = maxDim;
      scaledHeight = Math.round(maxDim / aspectRatio);
    } else {
      scaledHeight = maxDim;
      scaledWidth = Math.round(maxDim * aspectRatio);
    }
  }

  const adjustedWidth = Math.min(
    maxDim,
    Math.max(minDim, roundToMultipleOf16(scaledWidth)),
  );
  const adjustedHeight = Math.min(
    maxDim,
    Math.max(minDim, roundToMultipleOf16(scaledHeight)),
  );

  return { width: adjustedWidth, height: adjustedHeight };
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
