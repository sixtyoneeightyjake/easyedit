"use server";

import Together from "together-ai";

const together = new Together();

export async function generateImage({
  imageUrl,
  prompt,
  width,
  height,
}: {
  imageUrl: string;
  prompt: string;
  width: number;
  height: number;
}) {
  const adjustedDimensions = getAdjustedDimensions(width, height);

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

  const response = await together.images.create({
    // TODO: Update to the new model
    model: "black-forest-labs/FLUX.1-depth",
    width: adjustedDimensions.width,
    height: adjustedDimensions.height,
    steps: 28,
    prompt,
    image_url: imageUrl,
  });

  return response.data[0].url;
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
