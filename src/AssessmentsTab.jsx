import { useState, useEffect } from "react";
import { api } from "./api";
import { EmptyState } from "./JournalTab";

// ── Questionnaires ────────────────────────────────────────────────────────
const TESTS = {
  phq9: {
    label: "PHQ-9",
    sublabel: "Depression Screening",
    color: "#5ba4f5",
    icon: "🌧️",
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself",
      "Trouble concentrating",
      "Moving or speaking so slowly others noticed / being fidgety",
      "Thoughts of self-harm or being better off dead",
    ],
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day",
    ],
    interpret: (s) =>
      s <= 4
        ? { label: "Minimal", level: 0 }
        : s <= 9
          ? { label: "Mild", level: 1 }
          : s <= 14
            ? { label: "Moderate", level: 2 }
            : s <= 19
              ? { label: "Moderately severe", level: 3 }
              : { label: "Severe", level: 4 },
  },
  gad7: {
    label: "GAD-7",
    sublabel: "Anxiety Screening",
    color: "#e8b96a",
    icon: "😰",
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it's hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen",
    ],
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day",
    ],
    interpret: (s) =>
      s <= 4
        ? { label: "Minimal", level: 0 }
        : s <= 9
          ? { label: "Mild", level: 1 }
          : s <= 14
            ? { label: "Moderate", level: 2 }
            : { label: "Severe", level: 3 },
  },
  pss: {
    label: "PSS-10",
    sublabel: "Perceived Stress Scale",
    color: "#f47068",
    icon: "⚡",
    questions: [
      "Upset because of something unexpected",
      "Unable to control important things in your life",
      "Felt nervous and stressed",
      "Confident to handle personal problems (+)",
      "Things were going your way (+)",
      "Unable to cope with everything you had to do",
      "Able to control irritations (+)",
      "Felt on top of things (+)",
      "Angered by things outside your control",
      "Difficulties piling up so high you couldn't overcome them",
    ],
    options: [
      "Never",
      "Almost never",
      "Sometimes",
      "Fairly often",
      "Very often",
    ],
    reverse: [3, 4, 6, 7],
    interpret: (s) =>
      s <= 13
        ? { label: "Low stress", level: 0 }
        : s <= 26
          ? { label: "Moderate stress", level: 1 }
          : { label: "High stress", level: 2 },
  },
};

const LEVEL_COLORS = [
  "var(--green)",
  "#a8e063",
  "var(--gold)",
  "#ff9966",
  "var(--red)",
];

export default function AssessmentsTab() {
  const [view, setView] = useState("home"); // 'home' | test key | 'result'
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getScores()
      .then((d) => setScores(d.data || []))
      .catch(() => {});
  }, []);

  function startTest(key) {
    setActiveTest(key);
    setAnswers(new Array(TESTS[key].questions.length).fill(null));
    setView(key);
  }

  function answer(qi, val) {
    setAnswers((prev) => {
      const a = [...prev];
      a[qi] = val;
      return a;
    });
  }

  function submit() {
    const t = TESTS[activeTest];
    let score = answers.reduce((sum, a, i) => {
      let v = a;
      if (t.reverse && t.reverse.includes(i)) v = t.options.length - 1 - a;
      return sum + v;
    }, 0);
    const interp = t.interpret(score);
    const r = { test_type: activeTest, score, ...interp };
    setResult(r);
    setView("result");
    setSaving(true);
    api
      .addScore(activeTest, score, interp.label, interp.level)
      .then((d) => {
        setScores((prev) => {
          const filtered = prev.filter((s) => s.test_type !== activeTest);
          return [...filtered, d.data];
        });
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }

  if (view !== "home" && view !== "result") {
    const t = TESTS[view];
    const answered = answers.filter((a) => a !== null).length;
    const progress = answered / t.questions.length;
    const allAnswered = answered === t.questions.length;

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
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
            <div>
              <span style={{ fontSize: 20, marginRight: 8 }}>{t.icon}</span>
              <span
                style={{
                  fontFamily: "Playfair Display",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {t.label}
              </span>
              <span
                style={{ color: "var(--text3)", fontSize: 12, marginLeft: 8 }}
              >
                {t.sublabel}
              </span>
            </div>
            <button
              onClick={() => setView("home")}
              style={{
                color: "var(--text3)",
                background: "var(--surface2)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 12,
              }}
            >
              ← Back
            </button>
          </div>
          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: "var(--surface2)",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                width: `${progress * 100}%`,
                background: t.color,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
            {answered} of {t.questions.length} answered
          </p>
        </div>

        {/* Questions */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {t.questions.map((q, i) => (
            <div
              key={i}
              className="fade-in"
              style={{
                background: "var(--surface)",
                borderRadius: 16,
                padding: "16px",
                border: `1px solid ${answers[i] !== null ? t.color + "55" : "var(--border)"}`,
                animationDelay: `${i * 0.04}s`,
                transition: "border-color 0.2s",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{ color: t.color, fontWeight: 600, marginRight: 6 }}
                >
                  Q{i + 1}.
                </span>
                {q}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                }}
              >
                {t.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => answer(i, oi)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      fontSize: 12,
                      textAlign: "left",
                      background:
                        answers[i] === oi ? t.color : "var(--surface2)",
                      color: answers[i] === oi ? "#fff" : "var(--text2)",
                      border: `1px solid ${answers[i] === oi ? t.color : "var(--border)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={submit}
            disabled={!allAnswered}
            style={{
              padding: "13px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: allAnswered
                ? `linear-gradient(135deg, ${t.color}cc, ${t.color})`
                : "var(--surface3)",
              color: "#fff",
              opacity: allAnswered ? 1 : 0.5,
              transition: "all 0.2s",
              marginBottom: 24,
            }}
          >
            Submit Assessment
          </button>
        </div>
      </div>
    );
  }

  if (view === "result" && result) {
    const t = TESTS[result.test_type];
    const color = LEVEL_COLORS[result.level] || "var(--text)";
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="slide-up"
          style={{
            background: "var(--surface)",
            borderRadius: 24,
            padding: 36,
            border: "1px solid var(--border)",
            textAlign: "center",
            maxWidth: 360,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>{t.icon}</div>
          <h2
            style={{
              fontFamily: "Playfair Display",
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            {t.label}
          </h2>
          <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
            {t.sublabel}
          </p>

          <div
            style={{
              background: "var(--surface2)",
              borderRadius: 16,
              padding: "24px 20px",
              marginBottom: 24,
            }}
          >
            <div
              style={{ fontSize: 52, fontWeight: 700, color, marginBottom: 4 }}
            >
              {result.score}
            </div>
            <div
              style={{ fontSize: 18, fontWeight: 600, color, marginBottom: 8 }}
            >
              {result.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              {saving ? "Saving result…" : "Result saved ✓"}
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "var(--text2)",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {result.level >= 3
              ? "Consider speaking with a mental health professional. You're not alone."
              : result.level >= 2
                ? "Some support strategies may be helpful. Check the AI report for personalized advice."
                : "You're doing well. Keep monitoring your mental wellness regularly."}
          </p>

          <button
            onClick={() => setView("home")}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent2), var(--accent))",
              color: "#fff",
              boxShadow: "0 4px 16px var(--accent-glow)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Home view
  return (
    <div
      style={{ height: "100%", overflowY: "auto", padding: "20px 20px 80px" }}
    >
      <h2
        style={{
          fontFamily: "Playfair Display",
          fontSize: 20,
          marginBottom: 4,
        }}
      >
        Assessments
      </h2>
      <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
        Science-backed mental wellness screenings
      </p>

      {/* Previous scores */}
      {scores.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Your latest results
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {scores.map((s) => {
              const t = TESTS[s.test_type];
              const color = LEVEL_COLORS[s.level] || "var(--text)";
              return (
                <div
                  key={s.id}
                  style={{
                    background: "var(--surface)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    border: "1px solid var(--border)",
                    minWidth: 120,
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>
                    {t?.icon || "📊"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      marginBottom: 2,
                    }}
                  >
                    {t?.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>
                    {s.score}
                  </div>
                  <div style={{ fontSize: 11, color }}>{s.result}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Test cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Object.entries(TESTS).map(([key, t]) => (
          <button
            key={key}
            onClick={() => startTest(key)}
            style={{
              background: "var(--surface)",
              borderRadius: 18,
              padding: "20px",
              border: "1px solid var(--border)",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = t.color)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                flexShrink: 0,
                background: t.color + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {t.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--text)",
                  marginBottom: 3,
                }}
              >
                {t.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                {t.sublabel}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}
              >
                {t.questions.length} questions · ~2 min
              </div>
            </div>
            <div style={{ color: t.color, fontSize: 18 }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
