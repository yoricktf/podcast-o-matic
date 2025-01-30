'use client';
import Image from 'next/image';
import SkeletonLoader from './components/SkeletonLoader';
import { connectOpenAi } from './actions';
import { useState, useTransition } from 'react';

export default function HomePage() {
  const [isPending, startTransition] = useTransition();
  const [audioUrl, setAudioUrl] = useState(null);
  const [podcast, setPodcast] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    startTransition(async () => {
      try {
        const resultAi = await connectOpenAi(formData);
        // console.log(resultAi.message.choices[0].message.content);
        const podcastObject = await JSON.parse(
          resultAi.message.choices[0].message.content
        );
        setPodcast(podcastObject);

        await handleGenerateVoice(podcastObject.content);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error.message);
      }
    });
  };

  const handleGenerateVoice = async (podcastArray) => {
    if (!podcastArray) {
      alert('Please enter some podcastArray.');
      return;
    }
    setAudioUrl(null);
    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ podcastArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error(error);
      alert('Error generating audio. Please try again.');
    }
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
