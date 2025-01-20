'use client';

import React, { useState } from 'react';
const TextToSpeech = (podcastText) => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB');
  const [audioElement, setAudioElement] = useState(null);
  const [error, seterror] = useState(null);

  const handlegenerateAudio = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ podcastText, voice: selectedVoice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
      audio.play();
    } catch (error) {
      console.error('Error generating audio', error);
    } finally {
      setIsGenerating(false);
    }
  };
};
