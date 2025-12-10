// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./src/models/db');

// =============================
// 🔥 FIREBASE ADMIN (Base64 Key)
// =============================
const admin = require('firebase-admin');

if (!process.env.FIREBASE_KEY_BASE64) {
  console.error("❌ ERROR: FIREBASE_KEY_BASE64 missing in .env");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf8")
  );
} catch (err) {
    console.error("❌ Failed to parse Firebase Base64 key:", err);
    process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// =============================
// IMPORT ROUTES
// =============================
const authRoutes = require('./src/routes/auth');
const chatRoutes = require('./src/routes/chat');
const historyRoutes = require('./src/routes/history');
const msgRoutes = require('./src/routes/messages');
const profileRoutes = require('./src/routes/profile');
const deleteHistoryRoutes = require('./src/routes/deleteHistory');

// =============================
// EXPRESS APP SETUP
// =============================
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// STATIC PUBLIC FILES
// =============================
app.use(express.static(path.join(__dirname, 'public')));

// =============================
// FRONTEND ROUTES (Fix Render "Not Found")
// =============================

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Profile page
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Fallback — prevents "Not Found"
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================
// API ROUTES
// =============================
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/messages', msgRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/delete-history', deleteHistoryRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 ChatBuddy running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });
