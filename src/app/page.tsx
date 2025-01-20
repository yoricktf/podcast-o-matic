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
      console.log(formData);
      const resultAi = await connectOpenAi(formData);
      console.log(resultAi);
      const podcastObject = await JSON.parse(
        resultAi.message.choices[0].message.content
      );
      console.log('***********', podcastObject);
      handleGenerate(podcastObject);
      setPodcast(podcastObject);
      // setErrorMessage('');
    } catch (error) {
      // setErrorMessage(error.message);
    }
  };

  const handleGenerate = async (text) => {
    if (!text) {
      alert('Please enter some text.');
      return;
    }
    console.log('generate speech:::::::::::::::::', text);
    setLoading(true);
    setAudioUrl(null);
    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
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

// export default function Home() {

//   return (
//     <div>
//       <h1>Text-to-Speech with ElevenLabs</h1>
//       <textarea
//         rows='4'
//         placeholder='Enter text here...'
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
//       />
//       <button
//         onClick={handleGenerate}
//         disabled={loading}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#0070f3',
//           color: 'white',
//           border: 'none',
//           cursor: 'pointer',
//         }}
//       >
//         {loading ? 'Generating...' : 'Generate Audio'}
//       </button>

//       {audioUrl && (
//         <div style={{ marginTop: '20px' }}>
//           <h2>Generated Audio</h2>
//           <audio controls src={audioUrl}></audio>
//         </div>
//       )}
//     </div>
//   );
// }
