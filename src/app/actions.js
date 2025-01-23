'use server';

const apiKey = process.env.OPENAI_API_KEY; // Store your OpenAI API key in an environment variable
const url = 'https://api.openai.com/v1/chat/completions';

export async function connectOpenAi(formData) {
  const prompt = formData.get('prompt');
  console.log('@@@@@@@@@@@@@@@@@@@', prompt);
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
          content: `Imagine you are writing a podcast script featuring two hosts, Mike and Fran, who are experts in their fields but bring unique perspectives. They aim to break down ${prompt} in an engaging, conversational way that is accessible to both beginners and enthusiasts. The dialogue should include:
            A friendly introduction with a hook to draw listeners in.
            A clear explanation of the topic, including examples, analogies, or interesting facts.
            Questions or counterpoints to challenge or expand on ideas, mimicking a natural back-and-forth.
            Humor, relatable anecdotes, or pop culture references to keep the tone light and entertaining.
            A concluding segment summarizing the main points and offering actionable takeaways or food for thought for the listeners.
            Make sure their personalities come through in their dialogue. For example, Mike might be more analytical and data-driven, while Fran is more spontaneous and story-focused. respond in complete JSON object in the following format {"title": "here is the title you choose", "content": [{"host": "name of host", "message": "message from host"}]}`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 5000,
    }),
  });
  const data = await response.json();
  return { success: true, message: data };
}
