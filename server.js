require('dotenv').config();
console.log("ENV TEST:", process.env.GCP_PROJECT_ID);
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./src/models/db');

// ROUTES
const authRoutes = require('./src/routes/auth');
const chatRoutes = require('./src/routes/chat');
const historyRoutes = require('./src/routes/history');
const msgRoutes = require('./src/routes/messages');
const profileRoutes = require('./src/routes/profile');
const deleteHistoryRoutes = require('./src/routes/deleteHistory'); // ✅ delete-history route

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC PUBLIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/messages', msgRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/delete-history', deleteHistoryRoutes);

// HEALTH CHECK
app.get('/api/health', (req, res) => res.json({ ok: true }));

// START SERVER
const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ChatBuddy running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to init DB", err);
    process.exit(1);
  });
