const express = require('express');
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
  next();
})

// Highlight keywords in given reference text
router.post('/keywords', async (req, res) => {
  const referenceText = req.body.referenceText || '';
  console.log(referenceText);
  if (referenceText.trim().length === 0) {
    return res.send({
      error: true,
      errorMessage: "Please provide valid reference text"
    });
  }

  const messages = [
    {
      role: "system",
      content: "You are a helpful medical professional. Highlight keywords in the content you are provided to a max 20 words."
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
})

module.exports = router