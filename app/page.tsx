"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { generateImage } from "./actions";
import { ImageUploader } from "./ImageUploader";
import { SubmitButton } from "./SubmitButton";
import { Fieldset } from "./Fieldset";
import Spinner from "./Spinner";
import { preloadNextImage } from "@/lib/preload-next-image";
import clsx from "clsx";

export default function Home() {
  const [images, setImages] = useState<
    { url: string; version: number; prompt?: string }[]
  >([]);
  const [imageData, setImageData] = useState<{
    width: number;
    height: number;
  }>({ width: 1024, height: 768 });
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activeImage = images.find((i) => i.url === activeImageUrl);
  const latestImageIsActive = activeImage === images.at(-1);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-6 gap-4 px-4">
      <div>
        <div className="flex flex-col gap-4">
          {images
            .slice()
            .reverse()
            .map((image) => (
              <div className="flex items-center gap-3" key={image.url}>
                <span
                  className={clsx(
                    activeImageUrl === image.url
                      ? "text-white"
                      : "text-gray-400",
                    "w-4 shrink-0 font-mono text-xs",
                  )}
                >
                  v{image.version}
                </span>
                <button
                  className="cursor-pointer overflow-hidden rounded-md focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={() => setActiveImageUrl(image.url)}
                >
                  <Image
                    width={imageData.width}
                    height={imageData.height}
                    style={{
                      aspectRatio: imageData.width / imageData.height,
                    }}
                    src={image.url}
                    alt=""
                  />
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="col-span-4">
        {!activeImage ? (
          <>
            <h1 className="mx-auto max-w-md text-center text-4xl text-balance text-white">
              Edit any image with a simple prompt
            </h1>

            <div className="mt-8">
              <ImageUploader
                onUpload={({ url, width, height }) => {
                  setImageData({ width, height });
                  setImages([{ url, version: 0 }]);
                  setActiveImageUrl(url);
                }}
              />
            </div>
          </>
        ) : (
          <div>
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-900">
              <Image
                width={imageData.width}
                height={imageData.height}
                src={activeImage.url}
                style={{ aspectRatio: imageData.width / imageData.height }}
                alt="uploaded image"
                className="object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 flex gap-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 pt-8">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/75 font-mono text-xs">
                  v{activeImage.version}
                </div>
                {activeImage.prompt && (
                  <div>
                    <p className="text-base/8 text-gray-50">
                      {activeImage.prompt}
                    </p>
                  </div>
                )}
              </div>

              {pending && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900/75">
                  <Spinner className="size-6 text-white" />
                  <p className="text-xl text-white">
                    Working our pixel magic...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              {latestImageIsActive ? (
                <form
                  className="relative"
                  key={activeImageUrl}
                  action={(formData) => {
                    startTransition(async () => {
                      const prompt = formData.get("prompt") as string;
                      const lastImage = images.at(-1);
                      if (!lastImage) return;

                      const generatedImageUrl = await generateImage({
                        imageUrl: lastImage.url,
                        prompt,
                        width: imageData.width,
                        height: imageData.height,
                      });

                      if (generatedImageUrl) {
                        await preloadNextImage({
                          src: generatedImageUrl,
                          width: imageData.width,
                          height: imageData.height,
                        });
                        setImages((current) => [
                          ...current,
                          {
                            url: generatedImageUrl,
                            prompt,
                            version: current.length,
                          },
                        ]);
                        setActiveImageUrl(generatedImageUrl);
                      }
                    });
                  }}
                >
                  <Fieldset className="rounded-xl bg-gray-900">
                    <input
                      type="text"
                      name="prompt"
                      autoFocus
                      className="mr-2 w-full px-4 py-5 focus-visible:outline-none disabled:opacity-50"
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
