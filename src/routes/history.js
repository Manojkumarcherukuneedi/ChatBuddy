const express = require("express");
const router = express.Router();
const { getDB, all } = require("../models/db");
const { authRequired } = require("../middleware/auth");

router.get("/", authRequired, async (req, res) => {
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
});

module.exports = router;
