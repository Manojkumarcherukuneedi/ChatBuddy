const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");
require("dotenv").config();

const OpenAI = require("openai");

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const userText = req.body.message || "";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatBuddy. Reply in 2–3 short friendly sentences. Be casual and supportive."
        },
        {
          role: "user",
          content: userText
        }
      ]
    });

    const botText = response.choices[0].message.content;

    // Save chat to history
    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, userText, botText]
    );

    res.json({ reply: botText });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.json({
      reply: "⚠️ AI did not respond. Please try again later."
    });
  }
});

module.exports = router;
