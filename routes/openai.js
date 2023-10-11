const express = require('express');
const fs = require('fs');
const {execSync} = require('child_process')
const OpenAI = require('openai');

const router = express.Router()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.use((req, res, next) => {
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const referenceText = req.body.referenceText || '';

  if (referenceText.trim().length === 0) {
    return res.send({
      error: true,
      errorMessage: "Please provide valid reference text"
    });
  }
  next();
})

async function handleRequest(req, res, systemMessage) {
  const referenceText = req.body.referenceText;

  const messages = [
    {
      role: "system",
      content: systemMessage
    },
    {
      role: 'user',
      content: referenceText
    }
  ]
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.6,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  console.log(JSON.stringify(response.choices));
  res.send({
    error: false,
    data: response['choices'][0]['message']['content']
  });
}

// Highlight key concepts in given reference text
router.post('/key-concepts', async (req, res) => {
  const systemMessage = "You are a senior medical editor. Answer only using provided content. Summarize and simplify key concepts in the content you are provided in markdown format."

  handleRequest(req, res, systemMessage);
})

// Generate table from given reference text
router.post('/table', async (req, res) => {
  const systemMessage = "You are a senior medical editor. Answer only using provided content. Generate a table from content you are provided in markdown format."

  handleRequest(req, res, systemMessage);
})

// Generate flowchart from given reference text
router.post('/flowchart', async (req, res) => {
  const referenceText = req.body.referenceText;
  
  const messages = [
    {
      role: "system",
      content: `Behave as \"MermaidGPT\"; for every query the user submits, you are going to create an example of what Mermaid format for the inputted text looks like. Example map for an example topic: \nflowchart TD \nA[Christmas] →|Get money| B(Go shopping) \nB → C{Let me think} \nC →|One| D[Laptop]`
    },
    {
      role: 'user',
      content: referenceText
    }
  ]
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.6,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  console.log(JSON.stringify(response.choices));
  const diagram = response['choices'][0]['message']['content'];

  // convert mermaid diagram to svg
  fs.writeFileSync('input.mmd', diagram);
  execSync('npx mmdc -c mermaidConfig.json -i input.mmd -o output.svg');
  const svgContent = fs.readFileSync('output.svg', "utf-8");

  res.send({
    error: false,
    data: svgContent
  });
})

module.exports = router
