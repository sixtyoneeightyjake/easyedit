"use client";

import Image from "next/image";
import { useState } from "react";
import { generateImage } from "./actions";
import { ImageUploader } from "./ImageUploader";
import { SubmitButton } from "./SubmitButton";
import { Fieldset } from "./Fieldset";

export default function Home() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageData, setImageData] = useState<{
    width: number;
    height: number;
  }>({ width: 1024, height: 768 });
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-6 gap-4 px-4">
      <div>
        <div className="flex flex-col gap-2">
          {imageUrls
            .slice()
            .reverse()
            .map((url) => (
              <button key={url} onClick={() => setActiveImageUrl(url)}>
                <Image
                  width={imageData.width}
                  height={imageData.height}
                  style={{
                    aspectRatio: imageData.width / imageData.height,
                  }}
                  src={url}
                  alt="uploaded image"
                />
              </button>
            ))}
        </div>
      </div>

      <div className="col-span-4">
        {activeImageUrl === null ? (
          <>
            <h1 className="mx-auto max-w-md text-center text-4xl text-balance text-white">
              Edit any image with a simple prompt
            </h1>

            <div className="mt-8">
              <ImageUploader
                onUpload={({ url, width, height }) => {
                  setImageData({ width, height });
                  setImageUrls([url]);
                  setActiveImageUrl(url);
                }}
              />
            </div>
          </>
        ) : (
          <div className="">
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-900">
              <Image
                width={imageData.width}
                height={imageData.height}
                src={activeImageUrl}
                style={{ aspectRatio: imageData.width / imageData.height }}
                alt="uploaded image"
                className="object-contain"
              />
            </div>

            <div className="mt-4">
              {activeImageUrl === imageUrls.at(-1) ? (
                <form
                  className="relative"
                  action={async (formData) => {
                    const prompt = formData.get("prompt") as string;
                    const imageUrl = imageUrls.at(-1);
                    if (!imageUrl) return;

                    const generatedImage = await generateImage({
                      imageUrl,
                      prompt,
                      width: imageData.width,
                      height: imageData.height,
                    });

                    if (generatedImage) {
                      setImageUrls((current) => [...current, generatedImage]);
                      setActiveImageUrl(generatedImage);
                    }
                  }}
                >
                  <Fieldset>
                    <input
                      type="text"
                      name="prompt"
                      className="mr-2 w-full rounded-xl bg-gray-900 px-4 py-5 focus-visible:outline focus-visible:outline-white"
                      placeholder="Tell us the changes you want..."
                      required
                    />
                    <SubmitButton className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                      <svg
                        width="10"
                        viewBox="0 0 8 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.49996 9.24264C3.49997 9.51878 3.72382 9.74264 3.99997 9.74264C4.27611 9.74264 4.49996 9.51878 4.49997 9.24264L3.49996 9.24264ZM4.35352 0.403806C4.15826 0.208544 3.84167 0.208544 3.64641 0.403806L0.464431 3.58579C0.269169 3.78105 0.269169 4.09763 0.464431 4.29289C0.659693 4.48816 0.976276 4.48816 1.17154 4.29289L3.99996 1.46447L6.82839 4.29289C7.02365 4.48816 7.34024 4.48816 7.5355 4.29289C7.73076 4.09763 7.73076 3.78105 7.5355 3.58579L4.35352 0.403806ZM3.99996 9.24264L4.49997 9.24264V0.757359L3.99996 0.757359L3.49996 0.757359V9.24264L3.99996 9.24264Z"
                          fill="#262626"
                        />
                      </svg>
                    </SubmitButton>
                  </Fieldset>
                </form>
              ) : (
                <p>Select the latest version to make changes</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
