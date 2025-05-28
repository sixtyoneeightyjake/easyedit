/* eslint-disable @next/next/no-img-element */
'use client';

import { useS3Upload } from 'next-s3-upload';
import { useState } from 'react';
import { updateImage } from './actions';

export default function Home() {
  const { uploadToS3 } = useS3Upload();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await uploadToS3(file);
      console.log(result);
      setImageUrls([...imageUrls, result.url]);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {imageUrls.length === 0 ? (
        <form className='flex flex-col items-center justify-center'>
          <input type='file' accept='image/*' onChange={handleUpload} />
        </form>
      ) : (
        <div className=''>
          {imageUrls.map((url) => (
            <img src={url} alt='uploaded image' key={url} />
          ))}
          <form
            action={async (formData) => {
              const prompt = formData.get('prompt') as string;
              const imageUrl = imageUrls.at(-1);
              if (!imageUrl) return;
              const updatedImageUrl = await updateImage(imageUrl, prompt);
              if (updatedImageUrl) {
                setImageUrls([...imageUrls, updatedImageUrl]);
              }
            }}
          >
            <input type='text' name='prompt' placeholder='Make a change' />
            <button type='submit'>Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}
