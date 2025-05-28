'use server';

import Together from 'together-ai';

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

  const response = await together.images.create({
    // TODO: Update to the new model
    model: 'black-forest-labs/FLUX.1-depth',
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
  height: number
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
    Math.max(minDim, roundToMultipleOf16(scaledWidth))
  );
  const adjustedHeight = Math.min(
    maxDim,
    Math.max(minDim, roundToMultipleOf16(scaledHeight))
  );

  return { width: adjustedWidth, height: adjustedHeight };
}
