'use client';
import Image from 'next/image';
import SkeletonLoader from './components/SkeletonLoader';
import LoadingText from './components/LoadingText';
import { generatePodcast } from './actions';
import { useState, useTransition } from 'react';

export default function HomePage() {
  const [isPending, startTransition] = useTransition();
  const [audioUrl, setAudioUrl] = useState(null);
  const [podcast, setPodcast] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    setPodcast(null);
    setAudioUrl(null);
    setErrorMessage('');
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log('Submitting Form Data:', formData);
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
      <section className='banner'>
        <h1 className='title'>Podcast-o-Matic</h1>
        <h3>🎙️✨ Instant Podcasts on Any Topic! 🎙️✨</h3>
        <p>
          Meet Mike and Fran, your AI-powered podcast hosts who are ready to
          tackle any topic you throw their way! Just enter a subject, and
          they’ll generate a fully scripted, engaging podcast episode—ready for
          you to read or listen to. Whether it’s deep dives into history, tech
          trends, or the wildest conspiracy theories, Mike and Fran deliver
          entertaining and insightful discussions in seconds. 🚀 Instant.
          Custom. Unlimited. What will you make them talk about next?
        </p>
      </section>

      <form action={handleSubmit}>
        <input name='prompt' placeholder='Enter your prompt' />
        <button type='submit' disabled={isPending}>
          Submit
        </button>
      </form>

      {!isPending && podcast && (
        <div>
          <h2>{podcast?.title}</h2>

          {podcast?.content?.map((message, index) => (
            <div className={`textbox ${message.host}`} key={index}>
              <Image
                src={`/${message.host}.jpg`}
                alt={`${message.host}'s image`}
                width={50}
                height={50}
                className='avatar'
              />
              <p className='message'>
                {message.host}: {message.message}
              </p>
            </div>
          ))}

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
      {!isPending && audioUrl && (
        <div className='audio-container'>
          <h2>Your Personal Podcast</h2>
          <audio style={{ margin: '20px' }} controls src={audioUrl}></audio>
        </div>
      )}
      {isPending && (
        <>
          <LoadingText />
          <SkeletonLoader />
        </>
      )}
    </>
  );
}
