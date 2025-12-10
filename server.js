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
  console.error("❌ FIREBASE_KEY_BASE64 missing in .env");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf8")
  );
} catch (err) {
  console.error("❌ Failed to parse Firebase key:", err);
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
// FRONTEND ROUTES (Render Fix)
// =============================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 ChatBuddy running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });
