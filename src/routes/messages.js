const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/motivate", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  try {
    const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

    

    const prompt = `
Give a short motivational quote (1–2 sentences only).
Do not write long paragraphs.
Be uplifting and positive.
`;

    const result = await model.generateContent(prompt);
    const botText = result?.response?.text() || "Keep going — you got this! 💪";

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
