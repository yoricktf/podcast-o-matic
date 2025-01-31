'use server';

import { ElevenLabsClient } from 'elevenlabs';

const apiKey = process.env.OPENAI_API_KEY;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const openAiUrl = 'https://api.openai.com/v1/chat/completions';

export async function generatePodcast(formData) {
  const prompt = formData.get('prompt');

  try {
    const response = await fetch(openAiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Imagine you are writing a podcast script featuring two hosts, Mike and Fran, who are experts in their fields but bring unique perspectives. They aim to break down ${prompt} in an engaging, conversational way. Include humor and a friendly tone. Mike is a teacher and historian and very good with languages, Fran is a passionate and empathetic individual with a kind heart, driven by facts. Respond in JSON format with { "title": "title", "content": [{ "host": "name", "message": "message" }] }.`,
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 5000,
      }),
    });

    const data = await response.json();
    const podcastObject = JSON.parse(data.choices[0].message.content);

    const elevenlabs = new ElevenLabsClient({
      apiKey: elevenLabsApiKey,
    });

    const audioBuffers = [];

    for (const segment of podcastObject.content) {
      const { host, message } = segment;

      if (!host || !message) {
        throw new Error('Each segment must have a host and message');
      }

      const voice =
        host === 'Mike' ? '8s01jph49qpKh4ip8fXs' : 'FTkbXYvnvb2aWwldpPRj';
      const audioStream = await elevenlabs.generate({
        voice,
        text: message,
        model_id: 'eleven_flash_v2_5',
      });

      const audioBuffer = await streamToBuffer(audioStream);
      audioBuffers.push(audioBuffer);
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    const audioBase64 = combinedAudio.toString('base64');

    return { success: true, podcastObject, audioBase64 };
  } catch (error) {
    console.error('Error generating podcast or audio:', error);
    return { success: false, message: 'Failed to generate podcast and audio' };
  }
}

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
