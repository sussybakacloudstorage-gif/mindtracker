import { useState, useEffect } from "react";
import { api } from "./api";

const MOODS = ["😊", "😄", "😐", "😔", "😢", "😠", "😰", "🥳", "😴", "🤔"];
const TAGS = [
  "general",
  "work",
  "health",
  "family",
  "social",
  "hobby",
  "anxiety",
  "gratitude",
];
const TAG_COLORS = {
  general: "#9997aa",
  work: "#5ba4f5",
  health: "#5dd4a2",
  family: "#e8b96a",
  social: "#b06dff",
  hobby: "#f47068",
  anxiety: "#ff9966",
  gratitude: "#5dd4a2",
};

export default function JournalTab() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");
  const [tag, setTag] = useState("general");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getJournal()
      .then((d) => setEntries(d.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const d = await api.addJournal(text.trim(), mood, tag);
      setEntries((prev) => [d.data, ...prev]);
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id) {
    await api.deleteJournal(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "20px 20px 0",
      }}
    >
      {/* Write form */}
      <div
        className="fade-in"
        style={{
          background: "var(--surface)",
          borderRadius: 20,
          padding: 20,
          border: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "Playfair Display",
            fontSize: 18,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          How are you feeling?
        </h2>

        {/* Mood row */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              style={{
                fontSize: 22,
                background: mood === m ? "var(--surface3)" : "transparent",
                borderRadius: 8,
                padding: "4px 6px",
                border:
                  mood === m
                    ? "1px solid var(--accent)"
                    : "1px solid transparent",
                transition: "all 0.15s",
                cursor: "pointer",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Tag row */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20,
                background: tag === t ? TAG_COLORS[t] : "var(--surface2)",
                color: tag === t ? "#fff" : "var(--text3)",
                border: "none",
                transition: "all 0.15s",
                textTransform: "capitalize",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day, thoughts, feelings…"
            rows={3}
            style={{
              width: "100%",
              resize: "vertical",
              padding: "12px 14px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              fontSize: 14,
              lineHeight: 1.6,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {error && (
            <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !text.trim()}
            style={{
              marginTop: 10,
              padding: "10px 24px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent2), var(--accent))",
              color: "#fff",
              opacity: !text.trim() || loading ? 0.5 : 1,
              boxShadow: "0 4px 16px var(--accent-glow)",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Saving…" : "+ Add Entry"}
          </button>
        </form>
      </div>

      {/* Entries list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {fetching ? (
          <div
            style={{
              textAlign: "center",
              color: "var(--text3)",
              paddingTop: 32,
            }}
          >
            <span
              className="spin"
              style={{ display: "inline-block", fontSize: 20 }}
            >
              ⟳
            </span>
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon="📝" text="No journal entries yet. Start writing!" />
        ) : (
          entries.map((e, i) => (
            <div
              key={e.id}
              className="fade-in"
              style={{
                background: "var(--surface)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                padding: "16px 18px",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{e.mood || "😊"}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 20,
                      background: TAG_COLORS[e.tag] || "#9997aa",
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {e.tag || "general"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>
                    {e.date || ""}
                  </span>
                </div>
                <button
                  onClick={() => deleteEntry(e.id)}
                  style={{
                    background: "transparent",
                    color: "var(--text3)",
                    fontSize: 14,
                    padding: "2px 6px",
                    borderRadius: 6,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(ev) => (ev.target.style.color = "var(--red)")}
                  onMouseLeave={(ev) =>
                    (ev.target.style.color = "var(--text3)")
                  }
                >
                  ✕
                </button>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}
              >
                {e.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon, text }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "var(--text3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 40, opacity: 0.5 }}>{icon}</span>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}
