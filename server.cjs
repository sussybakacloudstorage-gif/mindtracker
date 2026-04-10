/* eslint-env node */
// ══════════════════════════════════════════════════════
// MindTracker — Backend API Server
// Node.js + Express + MySQL
// ══════════════════════════════════════════════════════

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET || "mindtracker_dev_secret_change_in_production";

// ── Middleware ────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());

// ── Database pool ─────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mindtracker",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

// ── Auth middleware ───────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── Init DB tables ────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      username    VARCHAR(50) UNIQUE NOT NULL,
      email       VARCHAR(100),
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      text        TEXT NOT NULL,
      mood        VARCHAR(10) DEFAULT '😊',
      tag         VARCHAR(50) DEFAULT 'general',
      timestamp   BIGINT NOT NULL,
      date_label  VARCHAR(30),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_ts (user_id, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS assessment_scores (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      test_type   VARCHAR(20) NOT NULL,
      score       INT NOT NULL,
      result      VARCHAR(50) NOT NULL,
      level       INT DEFAULT 0,
      date_label  VARCHAR(30),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_type (user_id, test_type, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS gratitude_entries (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      text        TEXT NOT NULL,
      date_label  VARCHAR(30),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS goals (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      text        TEXT NOT NULL,
      done        BOOLEAN DEFAULT FALSE,
      date_label  VARCHAR(30),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS ai_reports (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      content     LONGTEXT NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  conn.release();
  console.log("✅ Database tables initialized");
}

// ══════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  if (username.length < 3)
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  try {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username.trim(), email || null, hash],
    );
    const user = {
      id: result.insertId,
      username: username.trim(),
      email: email || null,
    };
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "30d" },
    );
    res.json({ token, user });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Username already taken" });
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username.trim()],
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "30d" },
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ══════════════════════════════════════════════════════
// JOURNAL ROUTES
// ══════════════════════════════════════════════════════

// GET /api/journal
app.get("/api/journal", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, text, mood, tag, timestamp, date_label AS date FROM journal_entries WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100",
      [req.user.id],
    );
    res.json({ data: rows });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/journal
app.post("/api/journal", auth, async (req, res) => {
  const { text, mood, tag } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const timestamp = Date.now();
  const date_label = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  try {
    const [result] = await pool.execute(
      "INSERT INTO journal_entries (user_id, text, mood, tag, timestamp, date_label) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        text,
        mood || "😊",
        tag || "general",
        timestamp,
        date_label,
      ],
    );
    res.json({
      data: {
        id: result.insertId,
        text,
        mood,
        tag,
        timestamp,
        date: date_label,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/journal/:id
app.delete("/api/journal/:id", auth, async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM journal_entries WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ══════════════════════════════════════════════════════
// ASSESSMENT SCORE ROUTES
// ══════════════════════════════════════════════════════

// GET /api/scores
app.get("/api/scores", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s1.* FROM assessment_scores s1
       INNER JOIN (
         SELECT test_type, MAX(created_at) AS max_date
         FROM assessment_scores WHERE user_id = ? GROUP BY test_type
       ) s2 ON s1.test_type = s2.test_type
            AND s1.created_at = s2.max_date
            AND s1.user_id = ?`,
      [req.user.id, req.user.id],
    );
    res.json({ data: rows.map((r) => ({ ...r, date: r.date_label })) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/scores/history
app.get("/api/scores/history", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM assessment_scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.user.id],
    );
    res.json({ data: rows.map((r) => ({ ...r, date: r.date_label })) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/scores
app.post("/api/scores", auth, async (req, res) => {
  const { test_type, score, result, level } = req.body;
  if (!test_type || score === undefined)
    return res.status(400).json({ error: "test_type and score required" });
  const date_label = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  try {
    const [r] = await pool.execute(
      "INSERT INTO assessment_scores (user_id, test_type, score, result, level, date_label) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, test_type, score, result, level || 0, date_label],
    );
    res.json({
      data: {
        id: r.insertId,
        test_type,
        score,
        result,
        level,
        date: date_label,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ══════════════════════════════════════════════════════
// GRATITUDE ROUTES
// ══════════════════════════════════════════════════════

app.get("/api/gratitude", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, text, date_label AS date FROM gratitude_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
      [req.user.id],
    );
    res.json({ data: rows });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/gratitude", auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const date_label = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  try {
    const [r] = await pool.execute(
      "INSERT INTO gratitude_entries (user_id, text, date_label) VALUES (?, ?, ?)",
      [req.user.id, text, date_label],
    );
    res.json({ data: { id: r.insertId, text, date: date_label } });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ══════════════════════════════════════════════════════
// GOALS ROUTES
// ══════════════════════════════════════════════════════

app.get("/api/goals", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, text, done, date_label AS date FROM goals WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json({ data: rows.map((r) => ({ ...r, done: !!r.done })) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/goals", auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text required" });
  const date_label = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  try {
    const [r] = await pool.execute(
      "INSERT INTO goals (user_id, text, date_label) VALUES (?, ?, ?)",
      [req.user.id, text, date_label],
    );
    res.json({ data: { id: r.insertId, text, done: false, date: date_label } });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/goals/:id/toggle", auth, async (req, res) => {
  try {
    await pool.execute(
      "UPDATE goals SET done = NOT done WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/goals/:id", auth, async (req, res) => {
  try {
    await pool.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ══════════════════════════════════════════════════════
// AI REPORT ROUTES
// ══════════════════════════════════════════════════════

app.get("/api/report", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT content, created_at FROM ai_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [req.user.id],
    );
    res.json({ data: rows[0] || null });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/report", auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content required" });
  try {
    await pool.execute(
      "INSERT INTO ai_reports (user_id, content) VALUES (?, ?)",
      [req.user.id, content],
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── Health check ──────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// ── Start ─────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 MindTracker API running on port ${PORT}`),
    );
  })
  .catch((e) => {
    console.error("❌ Failed to initialize database:", e.message);
    process.exit(1);
  });

module.exports = app;
