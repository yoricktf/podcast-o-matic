'use server';

const apiKey = process.env.OPENAI_API_KEY; // Store your OpenAI API key in an environment variable
const url = 'https://api.openai.com/v1/chat/completions';

export async function connectOpenAi(formData) {
  const prompt = formData.get('prompt');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4', // Specify the model you want to use
      messages: [
        {
          role: 'system',
          content: `You are two different people who are friends and who host a podcast together. I want you to look at the history, the current day usage and potential future usage and interesting facts of ${prompt} as well as provide statistics. you will respond in completed JSON object in the following format {"title": "here is the title you choose", "content": [{"host": "name of host", "message": "message from host"}, {"host": "name of host", "message": "message from host"}]}`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 5000,
    }),
  });
  const data = await response.json();
  return { success: true, message: data };
}
