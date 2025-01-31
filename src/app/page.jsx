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
        const result = await generatePodcast(formData);

        console.log('API Response:', result); // Log full response
        if (!result) throw new Error('No response from generatePodcast');

        const { success, podcastObject, audioBase64 } = result;

        console.log('Success:', success);
        console.log('Podcast Object:', podcastObject);
        console.log('Audio Base64:', audioBase64 ? 'Exists' : 'Missing');

        if (success && podcastObject) {
          setPodcast(podcastObject);

          if (audioBase64) {
            try {
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
            } catch (audioError) {
              console.error('Error decoding base64 audio:', audioError);
              setErrorMessage('Failed to process audio data.');
            }
          } else {
            setErrorMessage('Audio data is missing.');
          }
        } else {
          throw new Error('Invalid podcast data received.');
        }
      } catch (error) {
        console.error('Error generating podcast:', error);
        setErrorMessage(error.message);
      }
    });
  };

  return (
    <>
      <div className='container'>
        <section className='banner'>
          <h1 className='title'>Podcast-o-Matic</h1>
          <h3>🎙️✨ Instant Podcasts on Any Topic! 🎙️✨</h3>
          <p>
            Meet Mike and Fran, your AI-powered podcast hosts who are ready to
            tackle any topic you throw their way! Just enter a subject, and
            they’ll generate a fully scripted, engaging podcast episode—ready
            for you to read or listen to. Whether it’s deep dives into history,
            tech trends, or the wildest conspiracy theories, Mike and Fran
            deliver entertaining and insightful discussions in seconds. 🚀
            Instant. Custom. Unlimited. What will you make them talk about next?
          </p>
        </section>
      </div>

      <form action={handleSubmit}>
        <input name='prompt' placeholder='Enter your prompt' />
        <button type='submit' disabled={isPending}>
          Submit
        </button>
      </form>

      <h1>Your Podcast</h1>
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
      {isPending && <SkeletonLoader />}
    </>
  );
}
