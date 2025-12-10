const sqlite3 = require("sqlite3").verbose();
const path = require("path");

let db;

function getDB() {
  if (!db) {
    // ALWAYS use the database inside your project folder
    const dbPath = path.join(process.cwd(), "chatbuddy.db");
    console.log("Using database:", dbPath);

    db = new sqlite3.Database(dbPath);
  }
  return db;
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initDB() {
  const db = getDB();

  // USERS TABLE
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // HISTORY TABLE (CORRECT COLUMNS)
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_text TEXT,
      bot_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`
  );

  // MOTIVATION TABLE
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      content TEXT NOT NULL
    )`
  );

  // SEED IF EMPTY
  const count = await get(db, "SELECT COUNT(*) AS c FROM prompts");
  if (count.c === 0) {
    const items = [
      ["quote", "Believe in yourself, you can do it!"],
      ["quote", "One step at a time, keep going."],
      ["joke", "Why do programmers prefer dark mode? Because light attracts bugs."],
      ["joke", "Why was the computer cold? It forgot to close Windows."]
    ];

    for (const row of items) {
      await run(db, `INSERT INTO prompts (kind, content) VALUES (?, ?)`, row);
    }
  }
}

module.exports = { initDB, getDB, run, get, all };
