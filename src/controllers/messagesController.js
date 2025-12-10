const { getDB, get, run } = require("../models/db");

// -----------------------------
// RANDOM MOTIVATION MESSAGE
// -----------------------------
async function motivate(req, res) {
  try {
    const db = getDB();
    const userId = req.user.id;

    // Pick one random motivation (quote or joke)
    const row = await get(
      db,
      `SELECT content FROM prompts ORDER BY RANDOM() LIMIT 1`
    );

    const message = row ? row.content : "You got this! 💪";

    // Save ONLY bot_text (no user_text)
    await run(
      db,
      `INSERT INTO history (user_id, user_text, bot_text)
       VALUES (?, ?, ?)`,
      [userId, null, message]
    );

    res.json({ message });

  } catch (err) {
    console.error("MOTIVATE ERROR:", err);
    res.status(500).json({ message: "Error fetching motivation" });
  }
}

// Export
module.exports = {
  motivate,
};
