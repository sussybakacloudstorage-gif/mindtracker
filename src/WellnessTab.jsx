import { useState, useEffect } from "react";
import { api } from "./api";
import { EmptyState } from "./JournalTab";

export default function WellnessTab() {
  const [section, setSection] = useState("gratitude");
  const [gratitude, setGratitude] = useState([]);
  const [goals, setGoals] = useState([]);
  const [gratText, setGratText] = useState("");
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getGratitude()
      .then((d) => setGratitude(d.data || []))
      .catch(() => {});
    api
      .getGoals()
      .then((d) => setGoals(d.data || []))
      .catch(() => {});
  }, []);

  async function addGratitude(e) {
    e.preventDefault();
    if (!gratText.trim()) return;
    setLoading(true);
    try {
      const d = await api.addGratitude(gratText.trim());
      setGratitude((prev) => [d.data, ...prev]);
      setGratText("");
    } catch {}
    setLoading(false);
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!goalText.trim()) return;
    setLoading(true);
    try {
      const d = await api.addGoal(goalText.trim());
      setGoals((prev) => [d.data, ...prev]);
      setGoalText("");
    } catch {}
    setLoading(false);
  }

  async function toggleGoal(id) {
    await api.toggleGoal(id);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    );
  }

  async function deleteGoal(id) {
    await api.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          padding: "16px 20px 0",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {[
          { key: "gratitude", label: "🌸 Gratitude" },
          { key: "goals", label: "🎯 Goals" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            style={{
              padding: "9px 18px",
              borderRadius: "10px 10px 0 0",
              fontSize: 13,
              fontWeight: 500,
              background: section === key ? "var(--surface2)" : "transparent",
              color: section === key ? "var(--accent)" : "var(--text3)",
              borderBottom:
                section === key
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 80px" }}>
        {section === "gratitude" ? (
          <>
            <p
              style={{
                color: "var(--text3)",
                fontSize: 13,
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Research shows daily gratitude practice improves mood and
              resilience. What are you grateful for?
            </p>

            <form onSubmit={addGratitude} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={gratText}
                  onChange={(e) => setGratText(e.target.value)}
                  placeholder="I'm grateful for…"
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="submit"
                  disabled={loading || !gratText.trim()}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontSize: 18,
                    background:
                      "linear-gradient(135deg, #3db888, var(--green))",
                    color: "#fff",
                    opacity: !gratText.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 14px rgba(93,212,162,0.3)",
                  }}
                >
                  +
                </button>
              </div>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gratitude.length === 0 ? (
                <EmptyState
                  icon="🌸"
                  text="Add things you're grateful for today"
                />
              ) : (
                gratitude.map((g, i) => (
                  <div
                    key={g.id}
                    className="fade-in"
                    style={{
                      background: "var(--surface)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      border: "1px solid var(--border)",
                      borderLeft: "3px solid var(--green)",
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 16, marginTop: 1 }}>🌱</span>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--text)",
                            lineHeight: 1.5,
                          }}
                        >
                          {g.text}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text3)",
                            marginTop: 4,
                          }}
                        >
                          {g.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {goals.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: 14,
                  padding: "14px 18px",
                  marginBottom: 20,
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    {doneCount} / {goals.length} goals completed
                  </p>
                  <div
                    style={{
                      height: 6,
                      background: "var(--surface2)",
                      borderRadius: 3,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        width: `${goals.length ? (doneCount / goals.length) * 100 : 0}%`,
                        background:
                          "linear-gradient(90deg, #3db888, var(--green))",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 28 }}>
                  {doneCount === goals.length && goals.length > 0 ? "🎉" : "🎯"}
                </div>
              </div>
            )}

            <form onSubmit={addGoal} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Add a new goal…"
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <button
                  type="submit"
                  disabled={loading || !goalText.trim()}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontSize: 18,
                    background: "linear-gradient(135deg, #c99a45, var(--gold))",
                    color: "#fff",
                    opacity: !goalText.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 14px rgba(232,185,106,0.3)",
                  }}
                >
                  +
                </button>
              </div>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {goals.length === 0 ? (
                <EmptyState icon="🎯" text="Set your wellness goals" />
              ) : (
                goals.map((g, i) => (
                  <div
                    key={g.id}
                    className="fade-in"
                    style={{
                      background: "var(--surface)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      border: `1px solid ${g.done ? "rgba(93,212,162,0.3)" : "var(--border)"}`,
                      opacity: g.done ? 0.7 : 1,
                      transition: "all 0.2s",
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <button
                        onClick={() => toggleGoal(g.id)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: g.done
                            ? "var(--green)"
                            : "var(--surface2)",
                          border: `2px solid ${g.done ? "var(--green)" : "var(--border)"}`,
                          color: "#fff",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        {g.done ? "✓" : ""}
                      </button>
                      <p
                        style={{
                          flex: 1,
                          fontSize: 14,
                          color: g.done ? "var(--text3)" : "var(--text)",
                          textDecoration: g.done ? "line-through" : "none",
                          lineHeight: 1.5,
                        }}
                      >
                        {g.text}
                      </p>
                      <button
                        onClick={() => deleteGoal(g.id)}
                        style={{
                          background: "transparent",
                          color: "var(--text3)",
                          fontSize: 13,
                          padding: "2px 6px",
                          borderRadius: 6,
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.color = "var(--red)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.color = "var(--text3)")
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
