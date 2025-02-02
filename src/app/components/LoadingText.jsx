'use client';

import { useState, useEffect } from 'react';

const LoadingText = () => {
  const messages = [
    'Growing Podcast Hosts...',
    'Teaching them to read...',
    'Teaching them to write...',
    'Bathroom break...',
    'Reasearching your podcast...',
    'Reasearching your podcast some more...',
    'Reasearching your podcast even more...',
    'Another bathroom break...',
    'Writing down everything they learned...',
    'Recording podcast...',
    'Recording podcast again because Yorick forgot to turn his Mic on...',
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return; // Stop when reaching the last message

    const interval = setInterval(() => {
      setIndex((prevIndex) => prevIndex + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className='loading-container'>
      <p>{messages[index]}</p>
    </div>
  );
};

export default LoadingText;
