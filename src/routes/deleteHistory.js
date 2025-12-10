const express = require("express");
const router = express.Router();
const { getDB, run } = require("../models/db");
const { authRequired } = require("../middleware/auth");

router.delete("/", authRequired, async (req, res) => {
  const db = getDB();

  try {
    await run(db, "DELETE FROM history WHERE user_id = ?", [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE HISTORY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
