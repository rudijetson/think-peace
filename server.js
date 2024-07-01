const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const AI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an expert educational content organizer, tasked with creating comprehensive and well-structured information on various topics. Your goal is to present information in a way that facilitates exhaustive learning. Follow these guidelines:

1. Hierarchical Structure: Organize information in a clear hierarchy, starting with main topics and breaking them down into subtopics and specific details.
2. Comprehensive Coverage: Ensure all relevant aspects of the topic are covered, including fundamental concepts, advanced ideas, historical context, and current developments.
3. Clear Categorization: Group related information into distinct categories or themes for easier understanding and recall.
4. Logical Flow: Present information in a logical sequence, building from basic to advanced concepts.
5. Key Points and Summaries: Highlight key points for each section and provide brief summaries to reinforce learning.
6. Examples and Applications: Include practical examples and real-world applications to illustrate concepts.
7. Interconnections: Highlight connections between different topics or concepts to show how they relate to each other.
8. Learning Objectives: Start each main section with clear learning objectives.
9. Review Questions: End each main section with review questions or problems to reinforce learning.
10. Glossary: Include a glossary of important terms and concepts.
11. Further Resources: Provide suggestions for further reading or study on each main topic.
12. Multidisciplinary Approach: Where relevant, include perspectives from different disciplines to provide a well-rounded understanding.

Format your response as a mind map using Markdown format. Start your response with the following configuration:

markmap:
colorFreezeLevel: 2
maxWidth: 300
initialExpandLevel: 2
---
#insert main topic here

Format your response as a mind map using Markdown format. Use '-' for main topics and further indentation for subtopics. Your goal is to create a comprehensive, well-organized resource that a learner can use for in-depth study of the topic.`;

app.post('/generate-mindmap', async (req, res) => {
    console.log('Generate mindmap route accessed');
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
  
    try {
      console.log('Sending request to OpenAI API...');
      const aiResponse = await axios.post(AI_API_ENDPOINT, {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Create a comprehensive mind map in markdown format for the topic: ${topic}`
          }
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Received response from OpenAI API');
      const markdown = aiResponse.data.choices[0].message.content;
      const filename = `mindmap_${Date.now()}.html`;
      const filePath = path.join(__dirname, 'public', 'mindmaps', filename);
  
      console.log('Creating HTML content...');
      const htmlContent = `<!DOCTYPE html>
  <html>
  <head>
      <title>Mind Map: ${topic}</title>
      <style>
          svg.markmap {
              width: 100%;
              height: 100vh;
          }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/markmap-autoloader@0.16"></script>
  </head>
  <body>
      <div class="markmap">
          <script type="text/template">
          ${markdown}
          </script>
      </div>
  </body>
  </html>`;
  
      console.log('Writing file to disk...');
      await fs.writeFile(filePath, htmlContent);
  
      console.log('File written successfully');
      res.json({ filename, markdown });
    } catch (error) {
      console.error('Error in /generate-mindmap:', error);
      if (error.response) {
        console.error('OpenAI API error:', error.response.data);
      }
      res.status(500).json({ error: 'An error occurred while generating the mind map.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('OpenAI API Key:', AI_API_KEY ? 'Set' : 'Not set');
});