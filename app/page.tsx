/* eslint-disable @next/next/no-img-element */
'use client';

import { useS3Upload } from 'next-s3-upload';
import { useState } from 'react';
import { generateImage } from './actions';
import { useFormStatus } from 'react-dom';

export default function Home() {
  const { uploadToS3 } = useS3Upload();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadToS3(file);
      setImageUrls([result.url]);
      setActiveImageUrl(result.url);
    }
  };

  return (
    <div className='grid gap-2 grid-cols-6 max-w-2xl mx-auto pt-20'>
      <div>
        <div className='flex flex-col gap-2'>
          {imageUrls
            .slice()
            .reverse()
            .map((url) => (
              <button key={url} onClick={() => setActiveImageUrl(url)}>
                <img className='h-20' src={url} alt='uploaded image' />
              </button>
            ))}
        </div>
      </div>
      <div className='flex col-span-5 flex-col items-center justify-center'>
        {activeImageUrl === null ? (
          <form className='flex flex-col items-center justify-center'>
            <input type='file' accept='image/*' onChange={handleUpload} />
          </form>
        ) : (
          <div className=''>
            <div>
              <img src={activeImageUrl} alt='uploaded image' className='' />
            </div>

            <form
              action={async (formData) => {
                const prompt = formData.get('prompt') as string;
                const imageUrl = imageUrls.at(-1);
                if (!imageUrl) return;
                const generatedImage = await generateImage(imageUrl, prompt);
                if (generatedImage) {
                  setImageUrls((current) => [...current, generatedImage]);
                  setActiveImageUrl(generatedImage);
                }
              }}
            >
              <input type='text' name='prompt' placeholder='Make a change' />
              <SubmitButton />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitButton({
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`disabled:opacity-50 ${className}`}
      type='submit'
      disabled={pending}
      {...rest}
    >
      Submit
    </button>
  );
}
