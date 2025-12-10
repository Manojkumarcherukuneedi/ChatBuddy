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

router.get("/motivate", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Give a short motivational quote (1–2 sentences). Make it positive and simple."
        }
      ]
    });

    const botText = response.choices[0].message.content;

    // Save message
    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, "(motivate)", botText]
    );

    res.json({ message: botText });
  } catch (err) {
    console.error("MOTIVATION ERROR:", err);
    res.json({
      message: "🔥 Couldn't fetch motivation right now 😅"
    });
  }
});

module.exports = router;
