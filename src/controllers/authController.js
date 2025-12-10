const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, get, run } = require('../models/db');

async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  // 🚨 BACKEND PASSWORD STRENGTH CHECK
  const strongEnough =
      password.length >= 6 &&
      /[A-Z]/.test(password) &&            // at least 1 uppercase
      (/[0-9]/.test(password) ||           // OR at least 1 number
       /[^A-Za-z0-9]/.test(password));     // OR at least 1 symbol

  if (!strongEnough) {
    return res.status(400).json({
      error: "Weak password. Must include: 6+ chars, 1 uppercase letter, and at least 1 number or symbol."
    });
  }

  const db = getDB();
  try {
    const hash = await bcrypt.hash(password, 10);
    await run(db, 'INSERT INTO users(username, password_hash) VALUES(?,?)', [username, hash]);
    return res.json({ ok: true });
  } catch (e) {
    if (e && e.message && e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const db = getDB();
  try {
    const user = await get(db, 'SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    return res.json({ token, username: user.username });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
