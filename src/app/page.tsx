'use client';
// app/page.js

import { useState } from 'react';

export default function HomePage() {
  const [podcast, setPodcast] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(e.target[0].value);

    const prompt = e.target[0].value;

    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();

    console.log('Data:', data);

    console.log('podcast string', data.choices[0].message.content);

    const response = await JSON.parse(data.choices[0].message.content);

    setPodcast(response);
  };

  console.log(podcast);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='Enter your prompt' />
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
        </div>
      )}
    </div>
  );
}
