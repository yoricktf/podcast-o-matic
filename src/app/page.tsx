'use client';
import Image from 'next/image';
import SkeletonLoader from './components/SkeletonLoader';
import { generatePodcast } from './actions';
import { useState, useTransition } from 'react';

export default function HomePage() {
  const [isPending, startTransition] = useTransition();
  const [audioUrl, setAudioUrl] = useState(null);
  const [podcast, setPodcast] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    startTransition(async () => {
      try {
        const { success, podcastObject, audioBase64 } = await generatePodcast(
          formData
        );

        if (success) {
          setPodcast(podcastObject);

          // Convert base64 to a Blob URL
          const audioBlob = new Blob(
            [
              new Uint8Array(
                atob(audioBase64)
                  .split('')
                  .map((char) => char.charCodeAt(0))
              ),
            ],
            { type: 'audio/mpeg' }
          );
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          setErrorMessage('');
        } else {
          throw new Error('Failed to generate podcast or audio');
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    });
  };

  return (
    <>
      <form action={handleSubmit}>
        <input name='prompt' placeholder='Enter your prompt' />
        <button type='submit' disabled={isPending}>
          Submit
        </button>
      </form>
      {isPending && <SkeletonLoader />}

      {podcast && (
        <div>
          <h1>{podcast?.title}</h1>

          {podcast?.content?.map((message, index) => (
            <div className={`textbox ${message.host}`} key={index}>
              <Image
                src={`/${message.host}.jpg`}
                alt={`${message.host}'s image`}
                width={50}
                height={50}
                className='avatar'
              />
              <p>
                {message.host}: {message.message}
              </p>
            </div>
          ))}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Your Personal Podcast</h2>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </>
  );
}
