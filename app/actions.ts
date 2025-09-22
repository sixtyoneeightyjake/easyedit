/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getAdjustedDimensions } from "@/lib/get-adjusted-dimentions";
import { getTogether } from "@/lib/get-together";
import { z } from "zod";

const schema = z.object({
  imageUrl: z.string(),
  prompt: z.string(),
  width: z.number(),
  height: z.number(),
  model: z
    .enum(["black-forest-labs/FLUX.1-kontext-dev"])
    .default("black-forest-labs/FLUX.1-kontext-dev"),
});

export async function generateImage(
  unsafeData: z.infer<typeof schema>,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const { imageUrl, prompt, width, height, model } = schema.parse(unsafeData);

  const together = getTogether();
  const adjustedDimensions = getAdjustedDimensions(width, height);

  let url;
  try {
    const json = await together.images.create({
      model,
      prompt,
      width: adjustedDimensions.width,
      height: adjustedDimensions.height,
      steps: 28,
      image_url: imageUrl,
    });

    url = json.data[0].url;
  } catch (e: any) {
    console.log(e);
    // if the error contains "403", then it's a rate limit error
    if (e.toString().includes("403")) {
      return {
        success: false,
        error:
          "You need a paid Together AI account to use this model. Please upgrade by purchasing credits here: https://api.together.xyz/settings/billing.",
      };
    }
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
