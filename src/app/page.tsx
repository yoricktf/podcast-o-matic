'use client';
import { connectOpenAi } from './actions';
import { useState } from 'react';

export default function HomePage() {
  const [podcast, setPodcast] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData) => {
    console.log('triggered');
    try {
      const result = await connectOpenAi(formData);
      console.log('result', result);
      console.log(
        result,
        '&&&&&&&&&&&&&&',
        result.message.choices[0].message.content
      );

      setPodcast(await JSON.parse(result.message.choices[0].message.content));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
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
    </>
  );
}
