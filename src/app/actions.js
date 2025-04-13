'use server';

import { ElevenLabsClient } from 'elevenlabs';

const apiKey = process.env.OPENAI_API_KEY;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const openAiUrl = 'https://api.openai.com/v1/chat/completions';

export async function generatePodcast(formData) {
  console.log('Generating podcast with form data:', formData);

  const prompt = formData.get('prompt');
  let hosts = formData.getAll('host');
  if (!hosts || hosts.length === 0) {
    hosts = ['Yorick', 'Mike', 'Fran'];
  }
  console.log('Prompt:', prompt);
  console.log('HOSTSHOSTS====', hosts);
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
            content: `You are a podcast script generator that writes engaging, expert-level podcast conversations featuring hosts: ${hosts.join(
              ', '
            )}.
            Always respond ONLY in valid JSON. Use this format:
            {
              "title": "Podcast Title.",
              "content": [
                { "host": "HostName", "message": "First message" },
                { "host": "AnotherHost", "message": "Reply message" }
              ]
            }
            Each host should speak multiple times, with natural and insightful messages (2–4 sentences each). The entire script should be around 3 minutes. The podcast should be engaging and informative.`,
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 5000,
      }),
    });
    console.log('Response: ', response);

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

      const voices = {
        Mike: '8s01jph49qpKh4ip8fXs',
        Fran: 'FTkbXYvnvb2aWwldpPRj',
        Yorick: 'z6WPXIzoeKjLoUepplxV',
        Jens: 'NMTh6dE4GO7roOBPad1S',
      };

      const voice = voices[host] || 'defaultVoiceId';

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
