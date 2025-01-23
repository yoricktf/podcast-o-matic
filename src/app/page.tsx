'use client';

import { connectOpenAi } from './actions';
import { useState } from 'react';

export default function HomePage() {
  // const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [podcast, setPodcast] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    try {
      const resultAi = await connectOpenAi(formData);
      const podcastObject = await JSON.parse(
        resultAi.message.choices[0].message.content
      );
      await handleGenerateVoice(podcastObject.content);
      setPodcast(podcastObject);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleGenerateVoice = async (podcastArray) => {
    if (!podcastArray) {
      alert('Please enter some podcastArray.');
      return;
    }
    console.log('generate speech:::::::::::::::::', podcastArray);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form action={handleSubmit}>
        <input name='prompt' placeholder='Enter your prompt' />
        <button type='submit'>Submit</button>
      </form>
      {podcast && (
        <div>
          <h1>{podcast?.title}</h1>
          <h3>Response:</h3>
          {podcast?.content?.map((message, index) => (
            <p key={index}>
              {message.host}: {message.message}
            </p>
          ))}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>Generated Audio</h2>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </>
  );
}
