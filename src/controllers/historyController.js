const { getDB, all } = require("../models/db");

async function getHistory(req, res) {
  const db = getDB();

  try {
    const rows = await all(
      db,
      `SELECT user_text, bot_text, created_at
       FROM history
       WHERE user_id = ?
       ORDER BY id ASC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json([]);
  }
}

module.exports = { getHistory };
