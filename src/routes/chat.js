const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const userText = req.body.message || "";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are ChatBuddy.
Respond in 2–3 short friendly sentences.
Keep replies simple, helpful, and casual.
Do NOT write long paragraphs.

User: "${userText}"
`;

    const result = await model.generateContent(prompt);

    // Correct extraction for the new SDK
    const botText = result?.response?.text() || "I'm not sure what to say 😅";

    // Save message into DB
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
      reply: "⚠️ ChatBuddy had trouble talking to the AI. Try again in a moment."
    });
  }
});

module.exports = router;
