const express = require("express");
const router = express.Router();
const { getDB, get } = require("../models/db");
const { authRequired } = require("../middleware/auth");

router.get("/", authRequired, async (req, res) => {
  const db = getDB();
  const userId = req.user.id;

  try {
    const row = await get(
      db,
      "SELECT username, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }

    // Convert DB fields → Clean frontend response
    res.json({
      name: row.username,
      created: row.created_at
    });

  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

module.exports = router;
