'use server';

import Together from 'together-ai';

const together = new Together();

export async function updateImage(imageUrl: string, prompt: string) {
  const response = await together.images.create({
    // TODO: Update to the new model
    model: 'black-forest-labs/FLUX.1-depth',
    width: 1024,
    height: 1024,
    steps: 28,
    prompt,
    image_url: imageUrl,
  });

  return response.data[0].url;
}
