import { useState, useEffect, useRef } from "react";

const MOODS = ["😊", "😢", "😡", "😴", "🤯", "🥰", "😰"];

const QUESTIONS = [
  "Low interest or pleasure in things you used to enjoy?",
  "Feeling down, hopeless, or depressed?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or like a failure?",
  "Trouble concentrating on tasks or reading?",
  "Moving or speaking slowly, or being restless/fidgety?",
  "Thoughts of hurting yourself?",
];

const Q_OPTIONS = [
  "Not at all",
  "Several days",
  "More than half",
  "Nearly every day",
];

function getResult(score) {
  if (score <= 4) return { label: "Minimal", color: "green" };
  if (score <= 9) return { label: "Mild", color: "amber" };
  if (score <= 14) return { label: "Moderate", color: "orange" };
  return { label: "Severe", color: "red" };
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

export default function App() {
  // ── Auth ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [formU, setFormU] = useState("");
  const [formP, setFormP] = useState("");

  // ── Theme ─────────────────────────────────────────────
  const [dark, setDark] = useState(false);

  // ── Journal ───────────────────────────────────────────
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");

  // ── PHQ-9 Test ────────────────────────────────────────
  const [showTest, setShowTest] = useState(false);
  const [answers, setAnswers] = useState(Array(9).fill(-1));

  // ── Toast ─────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  // ── Effects ───────────────────────────────────────────
  useEffect(() => {
    const savedDark = localStorage.getItem("mt_dark");
    if (savedDark === "1") setDark(true);
    const savedUser = localStorage.getItem("mt_user");
    if (savedUser) {
      setUser(savedUser);
      const saved = localStorage.getItem(`mt_entries_${savedUser}`);
      if (saved) setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("mt_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    if (user)
      localStorage.setItem(`mt_entries_${user}`, JSON.stringify(entries));
  }, [entries, user]);

  // ── Helpers ───────────────────────────────────────────
  function showToast(msg) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2400);
  }

  // ── Auth ──────────────────────────────────────────────
  function handleAuth() {
    const u = formU.trim();
    const p = formP;
    if (!u || !p) {
      showToast("Please fill all fields");
      return;
    }
    const users = JSON.parse(localStorage.getItem("mt_users") || "{}");
    if (isSignup) {
      if (users[u]) {
        showToast("Username already taken");
        return;
      }
      users[u] = p;
      localStorage.setItem("mt_users", JSON.stringify(users));
      showToast("Account created!");
    } else {
      if (users[u] !== p) {
        showToast("Invalid credentials");
        return;
      }
    }
    localStorage.setItem("mt_user", u);
    setUser(u);
    const saved = localStorage.getItem(`mt_entries_${u}`);
    setEntries(saved ? JSON.parse(saved) : []);
  }

  function logout() {
    localStorage.removeItem("mt_user");
    setUser(null);
    setEntries([]);
    setText("");
  }

  // ── Journal ───────────────────────────────────────────
  function addEntry() {
    if (!text.trim()) {
      showToast("Write something first");
      return;
    }
    const entry = {
      id: Date.now(),
      text: text.trim(),
      mood,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setEntries((prev) => [entry, ...prev]);
    setText("");
    showToast("Entry saved ✓");
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast("Entry deleted");
  }

  // ── Stats ─────────────────────────────────────────────
  const thisWeek = entries.filter((e) => {
    const d = new Date(e.date);
    return Date.now() - d < 7 * 24 * 3600 * 1000;
  }).length;

  const moodCounts = {};
  entries.forEach((e) => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  const topMood =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // ── PHQ-9 ─────────────────────────────────────────────
  const score = answers.reduce((a, b) => a + (b < 0 ? 0 : b), 0);
  const answeredAll = answers.every((a) => a >= 0);
  const result = getResult(score);
  const scorePct = Math.round((score / 27) * 100);

  function setAnswer(qi, val) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = val;
      return next;
    });
  }

  // ══════════════════════════════════════════════════════
  // AUTH SCREEN
  // ══════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-logo">MindTracker</span>
            <span className="brand-sub">Your private wellness journal</span>
          </div>

          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="your username"
              value={formU}
              onChange={(e) => setFormU(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                document.getElementById("pw-input")?.focus()
              }
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              id="pw-input"
              type="password"
              placeholder="••••••••"
              value={formP}
              onChange={(e) => setFormP(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            />
          </div>

          <button className="btn btn-primary" onClick={handleAuth}>
            {isSignup ? "Create Account" : "Sign In"}
          </button>

          <span className="auth-toggle" onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </span>
        </div>
        <Toast message={toastMsg} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <span className="logo">MindTracker</span>
          <span className="logo-tag">wellness journal</span>
        </div>
        <nav className="header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀ Light" : "◑ Dark"}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowTest(true)}
          >
            PHQ‑9 Test
          </button>
          <a
            className="btn btn-ghost btn-sm"
            href="https://www.google.com/maps/search/mental+health+therapist+near+me"
            target="_blank"
            rel="noreferrer"
          >
            Find Help
          </a>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </nav>
      </header>

      {/* ── Stats ── */}
      <section className="section">
        <h2 className="section-title">Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total entries</div>
            <div className="stat-val">{entries.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This week</div>
            <div className="stat-val">{thisWeek}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top mood</div>
            <div className="stat-val">{topMood}</div>
          </div>
        </div>
      </section>

      {/* ── New Entry ── */}
      <section className="section">
        <h2 className="section-title">New entry</h2>
        <div className="mood-strip">
          {MOODS.map((m) => (
            <button
              key={m}
              className={`mood-btn${m === mood ? " active" : ""}`}
              onClick={() => setMood(m)}
              title={m}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="journal-box">
          <textarea
            className="journal-textarea"
            placeholder="What's on your mind today…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addEntry();
            }}
          />
          <div className="journal-footer">
            <span className="char-count">
              {text.length} chars · Ctrl+Enter to save
            </span>
            <button className="btn btn-primary btn-sm" onClick={addEntry}>
              Save entry
            </button>
          </div>
        </div>
      </section>

      {/* ── Entries ── */}
      <section className="section">
        <h2 className="section-title">
          Journal — {entries.length}{" "}
          {entries.length === 1 ? "entry" : "entries"}
        </h2>
        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📓</span>
              <p>No entries yet. Write your first one above.</p>
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-meta">
                    <span className="entry-mood">{e.mood}</span>
                    <span className="entry-date">{e.date}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEntry(e.id)}
                    title="Delete entry"
                  >
                    ✕
                  </button>
                </div>
                <p className="entry-text">{e.text}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── PHQ-9 Modal ── */}
      {showTest && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay"))
              setShowTest(false);
          }}
        >
          <div className="modal">
            <h2 className="modal-title">PHQ‑9 Assessment</h2>
            <p className="modal-sub">
              Over the last 2 weeks, how often have you been bothered by the
              following?
            </p>

            {QUESTIONS.map((q, i) => (
              <div key={i} className="q-item">
                <p className="q-text">
                  {i + 1}. {q}
                </p>
                <div className="q-options">
                  {Q_OPTIONS.map((label, v) => (
                    <button
                      key={v}
                      className={`q-opt${answers[i] === v ? " selected" : ""}`}
                      onClick={() => setAnswer(i, v)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {answeredAll && (
              <div className="score-section">
                <p className="score-meta">
                  Total score: <strong>{score}</strong> / 27
                </p>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${scorePct}%` }}
                    data-color={result.color}
                  />
                </div>
                <span className={`result-badge badge-${result.color}`}>
                  {result.label} symptoms
                </span>
                <p className="score-disclaimer">
                  This is a screening tool, not a clinical diagnosis. Please
                  consult a healthcare professional if you have concerns.
                </p>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setAnswers(Array(9).fill(-1))}
              >
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowTest(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} />
    </div>
  );
}
