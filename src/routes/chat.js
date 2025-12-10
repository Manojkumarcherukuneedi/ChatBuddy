const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;
  const userText = req.body.message || "";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"   // ✅ FIXED
    });

    const prompt = `
You are ChatBuddy.
Respond in ONLY 2–3 short friendly sentences.
Keep replies simple and casual.
User: "${userText}"
`;

    const result = await model.generateContent(prompt);
    const botText = result?.response?.text() || "I'm not sure what to say 😅";

    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, userText, botText]
    );

    res.json({ reply: botText });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.json({
      reply: "⚠️ AI did not respond. Check API key / server config."
    });
  }
});

module.exports = router;
