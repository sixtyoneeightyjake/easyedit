"use client";

import Image, { getImageProps } from "next/image";
import { useRef, useState, useTransition } from "react";
import { generateImage } from "./actions";
import { ImageUploader } from "./ImageUploader";
import { SubmitButton } from "./SubmitButton";
import { Fieldset } from "./Fieldset";
import Spinner from "./Spinner";
import { preloadNextImage } from "@/lib/preload-next-image";
import clsx from "clsx";
import { SampleImages } from "./SampleImages";
import { getAdjustedDimensions } from "@/lib/get-adjusted-dimentions";
import { DownloadIcon } from "./components/DownloadIcon";
import { toast } from "sonner";
import { PlusIcon } from "./components/PlusIcon";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeImage = images.find((i) => i.url === activeImageUrl);
  const latestImageIsActive = activeImage === images.at(-1);

  const adjustedImageDimensions = getAdjustedDimensions(
    imageData.height,
    imageData.height,
  );

  async function handleDownload() {
    if (!activeImage) return;

    const imageProps = getImageProps({
      src: activeImage.url,
      alt: "Generated image",
      height: imageData.height,
      width: imageData.width,
      quality: 100,
    });

    // Fetch the image
    const response = await fetch(imageProps.props.src);
    const blob = await response.blob();

    const extension = blob.type.includes("jpeg")
      ? "jpg"
      : blob.type.includes("png")
        ? "png"
        : blob.type.includes("webp")
          ? "webp"
          : "bin";

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `image.${extension}`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => {
            setImages([]);
            setActiveImageUrl(null);
          }}
          className="flex h-8 cursor-pointer items-center gap-2 rounded border-[0.5px] border-gray-700 bg-gray-900 px-3.5 text-gray-200 transition hover:bg-gray-800"
        >
          <PlusIcon />
          New
        </button>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 md:flex-row">
        <div
          ref={scrollRef}
          className="flex shrink-0 snap-x scroll-pl-4 gap-4 pt-1 pb-5 max-md:order-2 max-md:-mx-4 max-md:overflow-x-auto max-md:px-4 md:w-40 md:flex-col"
        >
          {images
            .slice()
            .reverse()
            .map((image) => (
              <div
                className="flex shrink-0 snap-start items-center gap-3"
                key={image.url}
              >
                <span
                  className={clsx(
                    activeImageUrl === image.url
                      ? "text-white"
                      : "text-gray-400",
                    "w-4 shrink-0 font-mono text-xs max-md:hidden",
                  )}
                >
                  v{image.version}
                </span>
                <button
                  className={clsx(
                    activeImageUrl === image.url &&
                      "max-md:outline max-md:outline-offset-2 max-md:outline-white",
                    "cursor-pointer overflow-hidden rounded-md focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white",
                  )}
                  onClick={() => setActiveImageUrl(image.url)}
                >
                  <Image
                    width={imageData.width}
                    height={imageData.height}
                    style={{
                      aspectRatio: imageData.width / imageData.height,
                    }}
                    className="w-auto max-md:h-20"
                    src={image.url}
                    alt=""
                  />
                </button>
              </div>
            ))}
        </div>

        <div className="grow">
          {!activeImage ? (
            <>
              <h1 className="mx-auto max-w-md text-center text-2xl text-balance text-white md:text-4xl">
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

              <div className="mt-8">
                <SampleImages
                  onSelect={({ url, width, height }) => {
                    setImageData({ width, height });
                    setImages([{ url, version: 0 }]);
                    setActiveImageUrl(url);
                  }}
                />
              </div>
            </>
          ) : (
            <div>
              <div className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-900">
                <Image
                  width={imageData.width}
                  height={imageData.height}
                  src={activeImage.url}
                  style={{
                    aspectRatio:
                      adjustedImageDimensions.width /
                      adjustedImageDimensions.height,
                  }}
                  // style={{ aspectRatio: imageData.width / imageData.height }}
                  alt="uploaded image"
                  className="object-contain max-md:h-[50vh] md:max-h-[80vh]"
                />

                <div
                  className="pointer-events-none absolute inset-0 hidden rounded-lg opacity-0 transition group-hover:opacity-100 md:block"
                  style={{
                    background:
                      "linear-gradient(rgba(0,0,0,.34) 0%,rgba(0,0,0,.337) 3.5%,rgba(0,0,0,.325) 7%,rgba(0,0,0,.306) 10.35%,rgba(0,0,0,.286) 13.85%,rgba(0,0,0,.263) 17.35%,rgba(0,0,0,.235) 20.85%,rgba(0,0,0,.21) 24.35%,rgba(0,0,0,.19) 27.85%,rgba(0,0,0,.165) 31.35%,rgba(0,0,0,.145) 34.85%,rgba(0,0,0,.125) 38.35%,rgba(0,0,0,.114) 41.85%,rgba(0,0,0,.1) 45.35% 48.85%,rgba(0,0,0,.1) 52.35%,rgba(0,0,0,.114) 55.85%,rgba(0,0,0,.125) 59.35%,rgba(0,0,0,.145) 62.85%,rgba(0,0,0,.165) 66.35%,rgba(0,0,0,.19) 69.85%,rgba(0,0,0,.21) 73.35%,rgba(0,0,0,.235) 76.85%,rgba(0,0,0,.263) 80.35%,rgba(0,0,0,.286) 83.85%,rgba(0,0,0,.306) 87.35%,rgba(0,0,0,.325) 90.85%,rgba(0,0,0,.337) 94.35%,rgba(0,0,0,.345) 97.85%,rgba(0,0,0,.35) 100%)",
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 pt-8">
                  <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/75 font-mono text-xs ring ring-white/10">
                      v{activeImage.version}
                    </div>
                    {activeImage.prompt && (
                      <div>
                        <p className="text-sm/8 text-gray-50 md:text-base/8">
                          {activeImage.prompt}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    title="Download this image"
                    // download="image.png"
                    // rel="nofollow"
                    onClick={handleDownload}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-gray-300 text-gray-900 transition hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <DownloadIcon />
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-px rounded-xl ring ring-white/10" />

                {pending && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900/75">
                    <Spinner className="size-6 text-white" />
                    <p className="text-xl text-white">
                      Working our pixel magic...
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 h-12">
                {latestImageIsActive ? (
                  <form
                    className="relative"
                    key={activeImageUrl}
                    action={(formData) => {
                      startTransition(async () => {
                        const prompt = formData.get("prompt") as string;
                        const lastImage = images.at(-1);
                        if (!lastImage) return;

                        const generation = await generateImage({
                          imageUrl: lastImage.url,
                          prompt,
                          width: imageData.width,
                          height: imageData.height,
                          userAPIKey:
                            localStorage.getItem("togetherApiKey") || "",
                        });

                        if (generation.success) {
                          await preloadNextImage({
                            src: generation.url,
                            width: imageData.width,
                            height: imageData.height,
                          });
                          setImages((current) => [
                            ...current,
                            {
                              url: generation.url,
                              prompt,
                              version: current.length,
                            },
                          ]);
                          setActiveImageUrl(generation.url);
                        } else {
                          toast(generation.error);
                        }
                      });
                    }}
                  >
                    <Fieldset className="relative rounded-xl bg-gray-900">
                      <div className="pointer-events-none absolute inset-px rounded-xl ring ring-white/10" />
                      <input
                        type="text"
                        name="prompt"
                        autoFocus
                        className="mr-2 w-full px-3 py-3 pr-14 focus-visible:outline-none disabled:opacity-50 md:px-4 md:py-5"
                        placeholder="Tell us the changes you want..."
                        required
                      />

                      <SubmitButton className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-900 transition hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-4 md:right-4">
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
                  <p className="text-base/12">
                    <button
                      onClick={() => {
                        setActiveImageUrl(images.at(-1)?.url ?? null);
                        scrollRef.current?.scrollTo({
                          left: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="cursor-pointer rounded leading-none text-sky-500 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-sky-500"
                    >
                      Select the latest version
                    </button>{" "}
                    to make more edits.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-40 shrink-0" />
      </div>
    </>
  );
}
