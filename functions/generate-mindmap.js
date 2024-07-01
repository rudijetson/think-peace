const axios = require('axios');

const AI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an expert educational content organizer, tasked with creating comprehensive and well-structured information on various topics...`; // Your full system prompt here

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { topic } = JSON.parse(event.body);

  if (!topic) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Topic is required' }) };
  }

  try {
    const aiResponse = await axios.post(AI_API_ENDPOINT, {
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a comprehensive mind map in markdown format for the topic: ${topic}` }
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const markdown = aiResponse.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ markdown })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while generating the mind map.' })
    };
  }
};