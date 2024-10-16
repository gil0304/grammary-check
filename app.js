const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/correct", async (req, res) => {
  const { japaneseText, englishText } = req.body;

  try {
    const prompt = `Here is a Japanese sentence: "${japaneseText}". Below is the English translation: "${englishText}". Please correct the English translation based on the Japanese text, and also provide feedback in Japanese. First, provide the corrected English sentence, and then provide feedback in Japanese.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for correcting English translations based on Japanese texts.",
        },
        { role: "user", content: prompt },
      ],
    });

    const fullResponse = response.choices[0].message.content.trim();
    const [correctedEnglish, japaneseFeedback] = fullResponse.split("\n\n");

    res.json({
      correctedText: correctedEnglish.trim(),
      feedback: japaneseFeedback.trim(),
    });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).send("Error processing request");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
