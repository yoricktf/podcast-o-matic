import { ElevenLabsClient } from 'elevenlabs';

export const POST = async (req) => {
  try {
    const { podcastArray } = await req.json();

    if (!podcastArray || !Array.isArray(podcastArray)) {
      return new Response(JSON.stringify({ error: 'Invalid podcastArray' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audioBuffers = [];

    for (const segment of podcastArray) {
      const { host, message } = segment;

      if (!host || !message) {
        return new Response(
          JSON.stringify({
            error: 'Each segment must have a host and message',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const voice = host === 'Mike' ? 'Charlie' : 'Sarah';
      const audioStream = await elevenlabs.generate({
        voice,
        text: message,
        model_id: 'eleven_multilingual_v2',
      });

      const audioBuffer = await streamToBuffer(audioStream);
      audioBuffers.push(audioBuffer);
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new Response(combinedAudio, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};
