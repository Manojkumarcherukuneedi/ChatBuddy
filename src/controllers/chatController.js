const { getDB, run } = require('../models/db');

// Simple rule-based engine
function generateResponse(message) {
  const m = message.toLowerCase();
  if (m.includes('hello') || m.includes('hi')) return "Hi! I'm here to listen. How are you feeling today?";
  if (m.includes('sad') || m.includes('down')) return "I'm sorry you're feeling that way. Want to talk about what's on your mind?";
  if (m.includes('happy')) return "That's awesome! What's making you feel happy?";
  if (m.includes('stress')) return "Stress can be tough. Try taking a short break and a deep breath. Want to share what's causing it?";
  return "I hear you. Tell me more—I'm listening.";
}

async function sendMessage(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const userId = req.user.id;
  const db = getDB();
  try {
    // save user message
    await run(db, 'INSERT INTO messages(user_id, sender, content) VALUES(?,?,?)', [userId, 'user', text]);
    // generate bot response
    const reply = generateResponse(text);
    await run(db, 'INSERT INTO messages(user_id, sender, content) VALUES(?,?,?)', [userId, 'bot', reply]);
    return res.json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to process message' });
  }
}

module.exports = { sendMessage };
