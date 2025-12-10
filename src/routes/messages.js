const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");

router.get("/motivate", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  const messages = [
    "You are capable of amazing things! 🌟",
    "Small progress is still progress 💫",
    "You're doing great, keep going! 💪",
    "Every day is a chance to grow 🌱",
    "Believe in yourself—you got this! 🚀"
  ];

  const botText = messages[Math.floor(Math.random() * messages.length)];

  try {
    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, "(motivate)", botText]
    );

    res.json({ message: botText });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.json({ message: "Motivation saved failed" });
  }
});

module.exports = router;
