const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("mt_token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Auth
  register: (u, p, e) =>
    request("POST", "/api/auth/register", {
      username: u,
      password: p,
      email: e,
    }),
  login: (u, p) =>
    request("POST", "/api/auth/login", { username: u, password: p }),

  // Journal
  getJournal: () => request("GET", "/api/journal"),
  addJournal: (text, mood, tag) =>
    request("POST", "/api/journal", { text, mood, tag }),
  deleteJournal: (id) => request("DELETE", `/api/journal/${id}`),

  // Scores
  getScores: () => request("GET", "/api/scores"),
  getScoresHistory: () => request("GET", "/api/scores/history"),
  addScore: (test_type, score, result, level) =>
    request("POST", "/api/scores", { test_type, score, result, level }),

  // Gratitude
  getGratitude: () => request("GET", "/api/gratitude"),
  addGratitude: (text) => request("POST", "/api/gratitude", { text }),

  // Goals
  getGoals: () => request("GET", "/api/goals"),
  addGoal: (text) => request("POST", "/api/goals", { text }),
  toggleGoal: (id) => request("PATCH", `/api/goals/${id}/toggle`),
  deleteGoal: (id) => request("DELETE", `/api/goals/${id}`),

  // AI Report
  getReport: () => request("GET", "/api/report"),
  saveReport: (content) => request("POST", "/api/report", { content }),
};

// ── Free AI via Anthropic Claude API (direct browser access) ──────────────
export async function generateAIReport(
  journalEntries,
  assessmentScores,
  gratitudeEntries,
  goals,
) {
  const journalSummary = journalEntries
    .slice(0, 10)
    .map(
      (e) =>
        `[${e.date || "recent"}, mood:${e.mood}, tag:${e.tag}] ${e.text.slice(0, 200)}`,
    )
    .join("\n");

  const scoresSummary = assessmentScores
    .map((s) => `${s.test_type.toUpperCase()}: ${s.score} (${s.result})`)
    .join(", ");

  const gratitudeSummary = gratitudeEntries
    .slice(0, 5)
    .map((g) => g.text)
    .join("; ");

  const goalsSummary = goals
    .map((g) => `[${g.done ? "✓" : "○"}] ${g.text}`)
    .join("\n");

  const prompt = `You are a compassionate mental wellness coach. Based on this person's data, write a warm, insightful 3-paragraph mental wellness report with actionable advice. Be encouraging and specific.

JOURNAL ENTRIES (recent):
${journalSummary || "No entries yet."}

ASSESSMENT SCORES:
${scoresSummary || "No assessments taken."}

GRATITUDE NOTES:
${gratitudeSummary || "None recorded."}

GOALS:
${goalsSummary || "No goals set."}

Write a personal, empathetic report with:
1. What's going well (based on their data)
2. Areas to watch or improve
3. Specific actionable steps for this week

Keep it warm, concise (250-350 words), and genuinely helpful. No bullet points, just flowing paragraphs.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "AI request failed");
  }

  const data = await res.json();
  return data.content?.[0]?.text || "Could not generate report.";
}

export function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
