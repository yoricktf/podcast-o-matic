// import { NextResponse } from 'next/server';

// export async function connectElevenLabs(req) {
//   const elevenlabsapikey = process.env.ELEVENLABS_API_KEY;

//   const { text, voice } = await req.json();

//   const response = await fetch(
//     `https://api.eleven-labs.com/v1/text-t0-speech/${voice}`,
//     {
//       method: 'POST',
//       headers: {
//         Accept: 'audio/mpeg',
//         'content-type': 'application/json',
//         'xi-api-key': elevenlabsapikey,
//       },
//       body: JSON.stringify({
//         text,
//         model_id: 'eleven_multilingual_v2',
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.75,
//         },
//       }),
//     }
//   );

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error('API error response', errorData);
//     const errorMessage = errorData.detail?.message || 'An error occurred';
//     return NextResponse.json(
//       { error: errorMessage },
//       { status: response.status }
//     );
//   }

//   const audioBuffer = await response.arrayBuffer();
//   const audioBase64 = Buffer.from(audioBuffer).toString('base64');

//   return NextResponse.json({ audioBase64 });
// }

import { ElevenLabsClient } from 'elevenlabs';

export const POST = async (req) => {
  try {
    const { text, voice = 'Sarah' } = await req.json();
    console.log('=====================', text);
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const audio = await elevenlabs.generate({
      voice,
      text,
      model_id: 'eleven_multilingual_v2',
    });

    return new Response(audio, {
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
