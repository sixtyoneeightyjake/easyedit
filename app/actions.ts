"use server";

import { getAdjustedDimensions } from "@/lib/get-adjusted-dimentions";
import { getIPAddress, getRateLimiter } from "@/lib/rate-limiter";
import Together from "together-ai";
import { z } from "zod";

const together = new Together();
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

  if (userAPIKey) {
    together.apiKey = userAPIKey;
  }

  const adjustedDimensions = getAdjustedDimensions(width, height);

  let url;
  try {
    const json = await together.images.create({
      model: "black-forest-labs/FLUX.1-kontext-pro",
      prompt,
      width: adjustedDimensions.width,
      height: adjustedDimensions.height,
      image_url: imageUrl,
    });

    url = json.data[0].url;
  } catch (error) {
    console.log(error);
  }

  if (url) {
    return { success: true, url };
  } else {
    return {
      success: false,
      error: "Image could not be generated. Please try again.",
    };
  }
}
