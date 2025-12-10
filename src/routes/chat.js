const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

// Load API key
console.log("Loaded KEY:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post("/", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const userText = req.body.message || "";

  try {
    // AI REQUEST — SHORT & FRIENDLY
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are ChatBuddy.
Respond in **ONLY 2–3 short friendly sentences**.
Keep replies simple, helpful, and casual.
Do NOT write long paragraphs.

User: "${userText}"
              `
            }
          ]
        }
      ]
    });

    // Extract model output
    const botText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm not sure what to say 😅";

    // Save message to database
    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, userText, botText]
    );

    res.json({ reply: botText });

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.json({
      reply: "⚠️ ChatBuddy had trouble talking to the AI. Try again in a moment."
    });
  }
});

module.exports = router;
