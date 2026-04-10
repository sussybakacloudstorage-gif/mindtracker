import { useState, useEffect, useRef, useCallback } from "react";

// ── Brand Logo ─────────────────────────────────────────────────────────────
const Logo = ({ size = 32 }) => (
  <svg
    width={size}
    height={Math.round(size * 0.72)}
    viewBox="0 0 100 72"
    fill="none"
  >
    <circle cx="38" cy="36" r="32" fill="#3B5BDB" fillOpacity="0.92" />
    <circle cx="62" cy="26" r="26" fill="#7048E8" fillOpacity="0.88" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════
// CONSTANTS & ASSESSMENT DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════
const PHQ9 = {
  id: "phq9",
  name: "PHQ-9",
  full: "Depression Screen (PHQ-9)",
  icon: "🧠",
  color: "#3B5BDB",
  bg: "#EEF2FF",
  desc: "Patient Health Questionnaire — validated depression severity screening tool",
  timeframe: "Over the last 2 weeks",
  questions: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed, or the opposite — being so fidgety or restless",
    "Thoughts that you would be better off dead, or of hurting yourself in some way",
  ],
  opts: [
    "Not at all (0)",
    "Several days (1)",
    "More than half the days (2)",
    "Nearly every day (3)",
  ],
  max: 27,
  reversed: [],
  score: (s) =>
    s <= 4
      ? {
          l: "Minimal Depression",
          sev: 0,
          action: "Monitor, may not require treatment",
        }
      : s <= 9
        ? {
            l: "Mild Depression",
            sev: 1,
            action: "Watchful waiting, consider counselling",
          }
        : s <= 14
          ? {
              l: "Moderate Depression",
              sev: 2,
              action: "Treatment plan, counselling and/or pharmacotherapy",
            }
          : s <= 19
            ? {
                l: "Moderately Severe",
                sev: 3,
                action:
                  "Active treatment recommended, pharmacotherapy and/or psychotherapy",
              }
            : {
                l: "Severe Depression",
                sev: 4,
                action: "Immediate referral to mental health specialist",
              },
};
const GAD7 = {
  id: "gad7",
  name: "GAD-7",
  full: "Anxiety Screen (GAD-7)",
  icon: "⚡",
  color: "#7048E8",
  bg: "#F3F0FF",
  desc: "Generalized Anxiety Disorder scale — validated anxiety severity measure",
  timeframe: "Over the last 2 weeks",
  questions: [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen",
  ],
  opts: [
    "Not at all (0)",
    "Several days (1)",
    "More than half the days (2)",
    "Nearly every day (3)",
  ],
  max: 21,
  reversed: [],
  score: (s) =>
    s <= 4
      ? { l: "Minimal Anxiety", sev: 0, action: "No action required" }
      : s <= 9
        ? { l: "Mild Anxiety", sev: 1, action: "Monitor, psychoeducation" }
        : s <= 14
          ? {
              l: "Moderate Anxiety",
              sev: 2,
              action: "Consider CBT or medication evaluation",
            }
          : {
              l: "Severe Anxiety",
              sev: 3,
              action: "Active treatment, referral recommended",
            },
};
const PSS10 = {
  id: "pss10",
  name: "PSS-10",
  full: "Perceived Stress Scale (PSS-10)",
  icon: "🌡",
  color: "#0CA678",
  bg: "#E6FCF5",
  desc: "Measures the degree to which situations in your life are appraised as stressful",
  timeframe: "In the last month",
  questions: [
    "Been upset because of something that happened unexpectedly?",
    "Felt that you were unable to control the important things in your life?",
    "Felt nervous and stressed?",
    "Felt confident about your ability to handle your personal problems?",
    "Felt that things were going your way?",
    "Found that you could not cope with all the things that you had to do?",
    "Been able to control irritations in your life?",
    "Felt that you were on top of things?",
    "Been angered because of things that were outside of your control?",
    "Felt difficulties were piling up so high that you could not overcome them?",
  ],
  opts: [
    "Never (0)",
    "Almost never (1)",
    "Sometimes (2)",
    "Fairly often (3)",
    "Very often (4)",
  ],
  max: 40,
  reversed: [3, 4, 6, 7],
  score: (s) =>
    s <= 13
      ? {
          l: "Low Stress",
          sev: 0,
          action: "Maintain current coping strategies",
        }
      : s <= 26
        ? {
            l: "Moderate Stress",
            sev: 1,
            action: "Stress management techniques recommended",
          }
        : {
            l: "High Stress",
            sev: 2,
            action: "Professional stress management support advised",
          },
};
const SLEEP = {
  id: "sleep",
  name: "ISI-7",
  full: "Insomnia Severity Index (ISI)",
  icon: "🌙",
  color: "#1971C2",
  bg: "#E7F5FF",
  desc: "Assesses the nature, severity, and impact of insomnia",
  timeframe: "Over the last 2 weeks",
  questions: [
    "Difficulty falling asleep",
    "Difficulty staying asleep through the night",
    "Problems waking up too early",
    "How satisfied/dissatisfied are you with your current sleep pattern?",
    "How noticeable to others do you think your sleep problem is?",
    "How worried/distressed are you about your current sleep problem?",
    "To what extent do you consider your sleep problem to interfere with your daily functioning?",
  ],
  opts: [
    "None / Very Satisfied (0)",
    "Mild (1)",
    "Moderate (2)",
    "Severe (3)",
    "Very Severe / Very Dissatisfied (4)",
  ],
  max: 28,
  reversed: [],
  score: (s) =>
    s <= 7
      ? { l: "No Clinical Insomnia", sev: 0, action: "No intervention needed" }
      : s <= 14
        ? {
            l: "Subthreshold Insomnia",
            sev: 1,
            action: "Sleep hygiene education",
          }
        : s <= 21
          ? { l: "Moderate Insomnia", sev: 2, action: "CBT-I recommended" }
          : {
              l: "Severe Insomnia",
              sev: 3,
              action: "Immediate evaluation, CBT-I and pharmacotherapy",
            },
};
const BURNOUT = {
  id: "burnout",
  name: "MBI-GS",
  full: "Burnout Inventory (MBI-GS)",
  icon: "🔥",
  color: "#E8590C",
  bg: "#FFF4E6",
  desc: "Maslach Burnout Inventory — measures professional/academic burnout dimensions",
  timeframe: "How often you experience the following",
  questions: [
    "I feel emotionally drained from my work or studies",
    "I feel used up at the end of a workday or study session",
    "I feel burned out from my work or studies",
    "I feel frustrated by my job or studies",
    "I doubt the significance of my work or studies",
    "I feel I'm at the end of my rope",
    "I feel I can effectively solve the problems that arise in my work",
    "I have accomplished many worthwhile things in my job",
    "In my work, I feel confident that I am effective at getting things done",
  ],
  opts: [
    "Never (0)",
    "A few times a year (1)",
    "Monthly (2)",
    "A few times a month (3)",
    "Weekly (4)",
    "A few times a week (5)",
    "Every day (6)",
  ],
  max: 48,
  reversed: [6, 7, 8],
  score: (s) =>
    s <= 15
      ? {
          l: "Low Burnout",
          sev: 0,
          action: "Maintain work-life balance practices",
        }
      : s <= 29
        ? {
            l: "Moderate Burnout",
            sev: 1,
            action: "Address stressors, consider coaching",
          }
        : s <= 40
          ? {
              l: "High Burnout",
              sev: 2,
              action: "Professional support strongly recommended",
            }
          : {
              l: "Critical Burnout",
              sev: 3,
              action: "Immediate intervention, reduce workload, seek help",
            },
};
const DASS21 = {
  id: "dass21",
  name: "DASS-21",
  full: "Depression Anxiety Stress Scales (DASS-21)",
  icon: "📊",
  color: "#862E9C",
  bg: "#F8F0FC",
  desc: "Measures three dimensions: depression, anxiety, and stress simultaneously",
  timeframe: "Over the past week",
  questions: [
    "I found it hard to wind down",
    "I was aware of dryness of my mouth",
    "I couldn't seem to experience any positive feeling at all",
    "I experienced breathing difficulty",
    "I found it difficult to work up the initiative to do things",
    "I tended to over-react to situations",
    "I experienced trembling (e.g. in the hands)",
    "I felt that I was using a lot of nervous energy",
    "I was worried about situations in which I might panic",
    "I felt that I had nothing to look forward to",
    "I found myself getting agitated",
    "I found it difficult to relax",
    "I felt down-hearted and blue",
    "I was intolerant of anything that kept me from getting on with what I was doing",
    "I felt I was close to panic",
    "I was unable to become enthusiastic about anything",
    "I felt I wasn't worth much as a person",
    "I felt that I was rather touchy",
    "I was aware of the action of my heart in the absence of physical exertion",
    "I felt scared without any good reason",
    "I felt that life was meaningless",
  ],
  opts: [
    "Did not apply at all (0)",
    "Applied somewhat (1)",
    "Applied considerably (2)",
    "Applied very much (3)",
  ],
  max: 63,
  reversed: [],
  score: (s) =>
    s <= 9
      ? { l: "Normal", sev: 0, action: "Within normal range" }
      : s <= 13
        ? { l: "Mild", sev: 1, action: "Monitor closely" }
        : s <= 20
          ? {
              l: "Moderate",
              sev: 2,
              action: "Professional assessment recommended",
            }
          : s <= 27
            ? { l: "Severe", sev: 3, action: "Treatment required" }
            : {
                l: "Extremely Severe",
                sev: 4,
                action: "Urgent mental health referral",
              },
};

const ASSESSMENTS = {
  phq9: PHQ9,
  gad7: GAD7,
  pss10: PSS10,
  sleep: SLEEP,
  burnout: BURNOUT,
  dass21: DASS21,
};
const ASSESS_ORDER = ["phq9", "gad7", "pss10", "sleep", "burnout", "dass21"];

const MOODS = [
  "😊",
  "😌",
  "😐",
  "😔",
  "😢",
  "😡",
  "😴",
  "🤯",
  "🥰",
  "😰",
  "😤",
  "🤒",
];
const MOOD_LABELS = {
  "😊": "Happy",
  "😌": "Calm",
  "😐": "Neutral",
  "😔": "Low",
  "😢": "Sad",
  "😡": "Angry",
  "😴": "Tired",
  "🤯": "Overwhelmed",
  "🥰": "Loved",
  "😰": "Anxious",
  "😤": "Frustrated",
  "🤒": "Unwell",
};

const CRISIS_WORDS = [
  "kill myself",
  "end my life",
  "want to die",
  "suicide",
  "suicidal",
  "don't want to live",
  "no reason to live",
  "hurt myself",
  "self harm",
  "cutting myself",
  "overdose",
  "end it all",
  "better off dead",
];

const CRISIS_LINES = [
  { name: "iCall (India)", ph: "9152987821", url: "https://icallhelpline.org" },
  {
    name: "Vandrevala Foundation",
    ph: "1860-2662-345",
    url: "https://www.vandrevalafoundation.com",
  },
  { name: "AASRA", ph: "9820466627", url: "http://www.aasra.info" },
  {
    name: "Find Therapist",
    ph: null,
    url: "https://www.google.com/maps/search/mental+health+therapist+near+me",
  },
];

const TAGS = [
  "General",
  "Work/Study",
  "Relationships",
  "Health",
  "Sleep",
  "Anxiety",
  "Achievement",
  "Gratitude",
];
const SEV_LABELS = ["Normal", "Mild", "Moderate", "Severe", "Critical"];
const SEV_COLORS = ["#2F9E44", "#F08C00", "#D9480F", "#C92A2A", "#6741D9"];
const SEV_BG = ["#EBFBEE", "#FFF9DB", "#FFE8D9", "#FFE3E3", "#F3F0FF"];

const BREATHING = [
  { label: "Inhale", dur: 4, color: "#3B5BDB" },
  { label: "Hold", dur: 4, color: "#7048E8" },
  { label: "Exhale", dur: 6, color: "#0CA678" },
  { label: "Hold", dur: 2, color: "#868E96" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
const isCrisis = (t) => CRISIS_WORDS.some((w) => t.toLowerCase().includes(w));
const fmt = (ts) =>
  new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function calcStreak(entries) {
  if (!entries.length) return 0;
  const days = [...new Set(entries.map((e) => dayKey(e.timestamp)))]
    .sort()
    .reverse();
  const today = dayKey(Date.now()),
    yest = dayKey(Date.now() - 86400000);
  if (days[0] !== today && days[0] !== yest) return 0;
  let n = 1;
  for (let i = 1; i < days.length; i++) {
    if ((new Date(days[i - 1]) - new Date(days[i])) / 86400000 === 1) n++;
    else break;
  }
  return n;
}

function calcScore(assessment, answers) {
  return answers.reduce((acc, v, i) => {
    if (v < 0) return acc;
    return (
      acc +
      (assessment.reversed.includes(i) ? assessment.opts.length - 1 - v : v)
    );
  }, 0);
}

// ── Claude AI caller — fully robust ───────────────────────────────────────
// ── Gemini AI caller — fixed & production-safe ────────────────────────────
async function callClaude(prompt, maxTokens = 2500) {
  const key = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!key) {
    throw new Error("MISSING_KEY");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens || 2048,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

  return text;
}

// ══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════

function Toast({ msg }) {
  if (!msg) return null;
  const isErr = msg.startsWith("⚠") || msg.startsWith("❌");
  return <div className={`toast${isErr ? " toast-err" : ""}`}>{msg}</div>;
}

function Sev({ level, label }) {
  return (
    <span
      className="sev-badge"
      style={{
        background: SEV_BG[level] || SEV_BG[0],
        color: SEV_COLORS[level] || SEV_COLORS[0],
      }}
    >
      <span
        className="sev-dot"
        style={{ background: SEV_COLORS[level] || SEV_COLORS[0] }}
      />
      {label}
    </span>
  );
}

function Bar({ val, max, color = "#3B5BDB", height = 6 }) {
  const pct = Math.min(100, Math.round((val / max) * 100));
  return (
    <div className="bar-track" style={{ height }}>
      <div
        className="bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── Crisis modal ───────────────────────────────────────────────────────────
function CrisisModal({ onClose }) {
  return (
    <div className="overlay crisis-overlay" role="dialog" aria-modal="true">
      <div className="modal crisis-modal">
        <div className="crisis-head">
          <span className="crisis-sos">🆘</span>
          <div>
            <h2 className="crisis-title">You are not alone</h2>
            <p className="crisis-sub">
              We noticed something concerning. Real help is available right now.
            </p>
          </div>
        </div>
        <div className="crisis-grid">
          {CRISIS_LINES.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="crisis-card"
            >
              <div className="crisis-org">{r.name}</div>
              {r.ph && <div className="crisis-ph">📞 {r.ph}</div>}
              <div className="crisis-go">Connect →</div>
            </a>
          ))}
        </div>
        <div className="crisis-emergency">
          <strong>Emergency services:</strong> 112 (India) · 911 (US) · 999 (UK)
        </div>
        <button className="btn btn-outline crisis-dismiss" onClick={onClose}>
          I am safe — close this
        </button>
      </div>
    </div>
  );
}

// ── Breathing exercise ─────────────────────────────────────────────────────
function BreathingModal({ onClose }) {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const phRef = useRef(0);
  phRef.current = phase;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          const nx = (phRef.current + 1) % BREATHING.length;
          if (nx === 0) setCycles((n) => n + 1);
          setPhase(nx);
          return BREATHING[nx].dur;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const cur = BREATHING[phase],
    R = 52,
    C = 2 * Math.PI * R;
  const elapsed = cur.dur - count,
    pct = elapsed / cur.dur;

  return (
    <div
      className="overlay"
      onClick={(e) => e.target.classList.contains("overlay") && onClose()}
    >
      <div className="modal breathing-modal">
        <div className="modal-head">
          <h2>Box Breathing</h2>
          <p className="modal-sub">
            4-4-6-2 technique · Reduces cortisol · Activates rest-and-digest
          </p>
        </div>
        <div className="breath-wrap">
          <svg viewBox="0 0 120 120" width={200} height={200}>
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="var(--border2)"
              strokeWidth="7"
            />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={cur.color}
              strokeWidth="7"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s linear",
                transform: "rotate(-90deg)",
                transformOrigin: "60px 60px",
              }}
            />
            <text
              x="60"
              y="52"
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted)"
              fontFamily="Inter,sans-serif"
            >
              {cur.label}
            </text>
            <text
              x="60"
              y="76"
              textAnchor="middle"
              fontSize="32"
              fill="var(--text)"
              fontFamily="Inter,sans-serif"
              fontWeight="600"
            >
              {count}
            </text>
          </svg>
        </div>
        <p className="breath-cycles">
          Completed cycles: <strong>{cycles}</strong>
        </p>
        <div className="breath-phases">
          {BREATHING.map((p, i) => (
            <div
              key={i}
              className={`breath-phase${phase === i ? " active" : ""}`}
              style={{ "--pc": p.color }}
            >
              <span>{p.label}</span>
              <span>{p.dur}s</span>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <button
            className="btn btn-outline"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setRunning(false);
              setPhase(0);
              setCount(4);
              setCycles(0);
            }}
          >
            ↺ Reset
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assessment modal ───────────────────────────────────────────────────────
function AssessmentModal({ asmt, onClose, onSave }) {
  const [ans, setAns] = useState(Array(asmt.questions.length).fill(-1));
  const score = calcScore(asmt, ans);
  const done = ans.every((a) => a >= 0);
  const res = done ? asmt.score(score) : null;

  return (
    <div
      className="overlay"
      onClick={(e) => e.target.classList.contains("overlay") && onClose()}
    >
      <div className="modal asmt-modal">
        <div className="asmt-header" style={{ borderColor: asmt.color }}>
          <div className="asmt-header-top">
            <span className="asmt-icon">{asmt.icon}</span>
            <div>
              <h2 className="asmt-title">{asmt.full}</h2>
              <p className="asmt-desc">{asmt.desc}</p>
            </div>
          </div>
          <div className="asmt-timeframe">
            ⏱ {asmt.timeframe} — {asmt.questions.length} questions · Max score:{" "}
            {asmt.max}
          </div>
        </div>

        <div className="q-list">
          {asmt.questions.map((q, i) => (
            <div key={i} className={`q-block${ans[i] >= 0 ? " answered" : ""}`}>
              <div className="q-row">
                <span className="q-idx">{i + 1}</span>
                <p className="q-text">{q}</p>
              </div>
              <div className="q-opts">
                {asmt.opts.map((opt, v) => (
                  <button
                    key={v}
                    className={`q-opt${ans[i] === v ? " sel" : ""}`}
                    style={
                      ans[i] === v
                        ? {
                            borderColor: asmt.color,
                            color: asmt.color,
                            background: asmt.bg,
                          }
                        : {}
                    }
                    onClick={() =>
                      setAns((prev) => {
                        const n = [...prev];
                        n[i] = v;
                        return n;
                      })
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {done && res && (
          <div
            className="asmt-result"
            style={{ borderColor: SEV_COLORS[res.sev] }}
          >
            <div className="asmt-result-top">
              <div>
                <div className="asmt-score-num">
                  {score} <span>/ {asmt.max}</span>
                </div>
                <Sev level={res.sev} label={res.l} />
              </div>
              <div className="asmt-action">
                <div className="asmt-action-label">Recommended action</div>
                <div className="asmt-action-text">{res.action}</div>
              </div>
            </div>
            <Bar
              val={score}
              max={asmt.max}
              color={SEV_COLORS[res.sev]}
              height={8}
            />
          </div>
        )}

        <div className="modal-foot">
          <div className="asmt-progress">
            {ans.filter((a) => a >= 0).length} / {asmt.questions.length}{" "}
            answered
          </div>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!done}
            onClick={() => {
              onSave(asmt.id, score, res);
              onClose();
            }}
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mood week chart ────────────────────────────────────────────────────────
function MoodWeek({ entries }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const moods = entries
      .filter((e) => dayKey(e.timestamp) === key)
      .map((e) => e.mood);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      moods,
      today: i === 6,
    };
  });
  return (
    <div className="mood-week">
      {days.map((d, i) => (
        <div key={i} className={`mood-day${d.today ? " today" : ""}`}>
          <div className="mood-day-emojis">
            {d.moods.length ? (
              d.moods.slice(0, 2).map((m, j) => <span key={j}>{m}</span>)
            ) : (
              <span className="mood-nil">·</span>
            )}
          </div>
          <div className="mood-day-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── AI Report panel ────────────────────────────────────────────────────────
function ReportPanel({ report, loading, onGenerate, hasData, error }) {
  const [open, setOpen] = useState({ 0: true });
  const sections = report ? parseReport(report) : [];

  return (
    <div className="report-panel">
      <div className="report-panel-header">
        <div className="report-header-left">
          <span className="ai-pulse-dot" />
          <span className="report-title-text">
            AI Clinical Assessment Report
          </span>
          {report && <span className="report-badge">Generated</span>}
        </div>
        {hasData && (
          <button
            className="btn btn-sm btn-primary"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spin-sm" />
                Analyzing…
              </>
            ) : report ? (
              "↻ Regenerate"
            ) : (
              "Generate Report"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="report-error">
          <div className="report-error-icon">⚠️</div>
          <div>
            <strong>AI Report Failed</strong>
            <p>{error}</p>
            {error.includes("MISSING_KEY") && (
              <p className="report-error-tip">
                Add VITE_GOOGLE_API_KEY: Netlify → Site Configuration →
                Environment Variables → <code>VITE_ANTHROPIC_KEY</code>
              </p>
            )}
          </div>
        </div>
      )}

      {!hasData && !error && (
        <div className="report-empty">
          <div className="report-empty-icon">📋</div>
          <h3>Complete assessments to generate your report</h3>
          <p>
            Complete at least one standardized assessment (PHQ-9, GAD-7, etc.)
            or write journal entries. The AI will then generate a comprehensive
            clinical report analyzing all your data.
          </p>
        </div>
      )}

      {hasData && !report && !loading && !error && (
        <div className="report-empty">
          <div className="report-empty-icon">🤖</div>
          <h3>Ready to generate your clinical report</h3>
          <p>
            Click <strong>Generate Report</strong> above. Claude will analyze
            all your assessment scores, journal entries, mood patterns, and
            goals to produce a comprehensive clinical-grade report with
            personalized recommendations.
          </p>
          <ul className="report-includes">
            <li>✓ Executive summary of mental health status</li>
            <li>✓ Analysis of all assessment scores</li>
            <li>✓ Journal sentiment & pattern analysis</li>
            <li>✓ Risk assessment</li>
            <li>✓ Evidence-based recommendations</li>
            <li>✓ Personalized 30-day action plan</li>
          </ul>
        </div>
      )}

      {loading && (
        <div className="report-loading">
          {[
            "Analyzing assessment scores",
            "Processing journal sentiment & themes",
            "Identifying cognitive patterns",
            "Running risk stratification",
            "Formulating recommendations",
            "Compiling clinical report",
          ].map((s, i) => (
            <div
              key={i}
              className="loading-step"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <span
                className="loading-step-dot"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {report && !loading && (
        <div className="report-body">
          {sections.length > 0 ? (
            sections.map((sec, i) => (
              <div key={i} className="report-sec">
                <button
                  className="report-sec-head"
                  onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                >
                  <span>{sec.title}</span>
                  <span className="report-chevron">{open[i] ? "▲" : "▼"}</span>
                </button>
                {open[i] !== false && (
                  <div className="report-sec-body">
                    {sec.content.split("\n").map((line, j) => {
                      const t = line.trim();
                      if (!t) return null;
                      if (t.match(/^[-•]\s/))
                        return (
                          <p key={j} className="report-bullet">
                            <span>•</span>
                            {t.replace(/^[-•]\s/, "")}
                          </p>
                        );
                      if (t.match(/^\d+\.\s/))
                        return (
                          <p key={j} className="report-num">
                            {t}
                          </p>
                        );
                      return (
                        <p key={j} className="report-p">
                          {t}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="report-raw">
              {report.split("\n").map((line, i) => {
                const t = line.trim();
                if (!t) return <br key={i} />;
                if (t.match(/^\*\*(.*)\*\*$/))
                  return (
                    <h4 key={i} className="report-raw-head">
                      {t.replace(/\*\*/g, "")}
                    </h4>
                  );
                if (t.match(/^[-•]\s/))
                  return (
                    <p key={i} className="report-bullet">
                      <span>•</span>
                      {t.replace(/^[-•]\s/, "")}
                    </p>
                  );
                return (
                  <p key={i} className="report-p">
                    {t.replace(/\*\*/g, "")}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function parseReport(text) {
  const secs = [],
    lines = text.split("\n");
  let cur = null;
  for (const line of lines) {
    const m =
      line.match(/^\*\*([^*]+)\*\*\s*$/) ||
      line.match(/^#{1,3}\s+(.+)/) ||
      line.match(/^\d+\.\s+\*\*([^*]+)\*\*/);
    if (m) {
      if (cur) secs.push(cur);
      cur = { title: m[1].trim(), content: "" };
    } else if (cur) {
      cur.content += (cur.content ? "\n" : "") + line;
    }
  }
  if (cur) secs.push(cur);
  return secs;
}

// ── LocalStorage API wrapper ───────────────────────────────────────────────
async function callAPI(endpoint, method = "GET", body = null) {
  const base = import.meta.env.VITE_API_BASE;
  if (!base) return null;
  const opts = { method, headers: { "Content-Type": "application/json" } };
  const tk = localStorage.getItem("mt_token");
  if (tk) opts.headers["Authorization"] = `Bearer ${tk}`;
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(`${base}/api${endpoint}`, opts);
    return await r.json();
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  // Auth
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [fmU, setFmU] = useState("");
  const [fmP, setFmP] = useState("");
  const [fmE, setFmE] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // UI
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState("");
  const toastRef = useRef(null);

  // Journal
  const [entries, setEntries] = useState([]);
  const [jText, setJText] = useState("");
  const [jMood, setJMood] = useState("😊");
  const [jTag, setJTag] = useState("General");

  // Assessments
  const [scores, setScores] = useState({});
  const [asmtHistory, setAsmtHistory] = useState([]);
  const [activeAsmt, setActiveAsmt] = useState(null);

  // Gratitude
  const [grText, setGrText] = useState("");
  const [grList, setGrList] = useState([]);

  // Goals
  const [goalText, setGoalText] = useState("");
  const [goals, setGoals] = useState([]);

  // Notes (clinical notes)
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("Observation");

  // AI
  const [report, setReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Modals
  const [showCrisis, setShowCrisis] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [showApiHelp, setShowApiHelp] = useState(false);

  // DB
  const [dbMode, setDbMode] = useState(false);

  // ── Load ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const dk = localStorage.getItem("mt_dark");
    if (dk === "1") setDark(true);
    const tk = localStorage.getItem("mt_token");
    const u = localStorage.getItem("mt_user");
    if (tk && u) {
      setUser(JSON.parse(u));
      setDbMode(true);
      loadDB();
    } else {
      const lu = localStorage.getItem("mt_lu");
      if (lu) {
        const pu = JSON.parse(lu);
        setUser(pu);
        loadLocal(pu.u);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("mt_dark", dark ? "1" : "0");
  }, [dark]);

  function loadLocal(u) {
    const load = (k, def) => {
      try {
        const v = localStorage.getItem(`mt_${k}_${u}`);
        return v ? JSON.parse(v) : def;
      } catch {
        return def;
      }
    };
    setEntries(load("ent", []));
    setScores(load("sc", {}));
    setAsmtHistory(load("ah", []));
    setGrList(load("gr", []));
    setGoals(load("go", []));
    setNotes(load("no", []));
    const rep = localStorage.getItem(`mt_rep_${u}`);
    if (rep) setReport(rep);
    const ch = localStorage.getItem(`mt_ch_${u}`);
    if (ch) setChatMsgs(JSON.parse(ch));
  }

  async function loadDB() {
    const [j, s, g, go] = await Promise.all([
      callAPI("/journal"),
      callAPI("/scores"),
      callAPI("/gratitude"),
      callAPI("/goals"),
    ]);
    if (j?.data) setEntries(j.data);
    if (s?.data) {
      const sc = {};
      s.data.forEach((r) => {
        sc[r.test_type] = {
          score: r.score,
          result: r.result,
          level: r.level,
          date: r.date_label,
        };
      });
      setScores(sc);
    }
    if (g?.data) setGrList(g.data);
    if (go?.data) setGoals(go.data);
  }

  const un =
    user?.u || user?.username || (typeof user === "string" ? user : "");

  function sl(key, val) {
    if (un) localStorage.setItem(`mt_${key}_${un}`, JSON.stringify(val));
  }
  function sls(key, val) {
    if (un) localStorage.setItem(`mt_${key}_${un}`, val);
  }

  function showMsg(msg) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 3200);
  }

  // ── Auth ───────────────────────────────────────────────────────────────
  async function doAuth() {
    if (!fmU.trim() || !fmP) {
      showMsg("⚠ Please fill all fields");
      return;
    }
    if (isSignup && fmP.length < 6) {
      showMsg("⚠ Password must be 6+ characters");
      return;
    }
    setAuthBusy(true);

    const ep = isSignup ? "/auth/register" : "/auth/login";
    const bd = isSignup
      ? { username: fmU.trim(), password: fmP, email: fmE }
      : { username: fmU.trim(), password: fmP };
    const res = await callAPI(ep, "POST", bd);

    if (res?.token) {
      setToken(res.token);
      const u = res.user;
      localStorage.setItem("mt_token", res.token);
      localStorage.setItem("mt_user", JSON.stringify(u));
      setUser(u);
      setDbMode(true);
      await loadDB();
      showMsg(isSignup ? "Account created — welcome! 🎉" : "Welcome back!");
    } else {
      const users = JSON.parse(localStorage.getItem("mt_users") || "{}");
      if (isSignup) {
        if (users[fmU.trim()]) {
          showMsg("⚠ Username already taken");
          setAuthBusy(false);
          return;
        }
        users[fmU.trim()] = fmP;
        localStorage.setItem("mt_users", JSON.stringify(users));
      } else {
        if (users[fmU.trim()] !== fmP) {
          showMsg("⚠ Invalid username or password");
          setAuthBusy(false);
          return;
        }
      }
      const u = { u: fmU.trim(), username: fmU.trim(), email: fmE };
      setUser(u);
      localStorage.setItem("mt_lu", JSON.stringify(u));
      loadLocal(fmU.trim());
      showMsg(isSignup ? "Account created (local mode)" : "Signed in");
    }
    setAuthBusy(false);
  }

  function logout() {
    ["mt_token", "mt_user", "mt_lu"].forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setEntries([]);
    setScores({});
    setAsmtHistory([]);
    setGrList([]);
    setGoals([]);
    setNotes([]);
    setReport("");
    setChatMsgs([]);
  }

  // ── Journal ────────────────────────────────────────────────────────────
  async function addEntry() {
    if (!jText.trim()) {
      showMsg("⚠ Write something first");
      return;
    }
    if (isCrisis(jText)) setShowCrisis(true);
    const e = {
      id: Date.now(),
      text: jText.trim(),
      mood: jMood,
      tag: jTag,
      date: fmt(Date.now()),
      timestamp: Date.now(),
    };
    const upd = [e, ...entries];
    setEntries(upd);
    sl("ent", upd);
    setJText("");
    if (dbMode)
      await callAPI("/journal", "POST", {
        text: e.text,
        mood: e.mood,
        tag: e.tag,
      });
    showMsg("Entry saved ✓");
  }

  async function delEntry(id) {
    const upd = entries.filter((e) => e.id !== id);
    setEntries(upd);
    sl("ent", upd);
    if (dbMode) await callAPI(`/journal/${id}`, "DELETE");
    showMsg("Entry deleted");
  }

  // ── Assessments ────────────────────────────────────────────────────────
  async function saveScore(type, score, res) {
    const rec = {
      score,
      result: res.l,
      level: res.sev,
      action: res.action,
      date: fmt(Date.now()),
      timestamp: Date.now(),
    };
    const upd = { ...scores, [type]: rec };
    setScores(upd);
    sl("sc", upd);
    const ah = [{ type, ...rec }, ...asmtHistory].slice(0, 100);
    setAsmtHistory(ah);
    sl("ah", ah);
    if (dbMode)
      await callAPI("/scores", "POST", {
        test_type: type,
        score,
        result: res.l,
        level: res.sev,
      });
    showMsg(`${ASSESSMENTS[type].name} saved ✓`);
  }

  // ── Gratitude ──────────────────────────────────────────────────────────
  async function addGratitude() {
    if (!grText.trim()) {
      showMsg("⚠ Write something first");
      return;
    }
    const item = { id: Date.now(), text: grText.trim(), date: fmt(Date.now()) };
    const upd = [item, ...grList];
    setGrList(upd);
    sl("gr", upd);
    setGrText("");
    if (dbMode) await callAPI("/gratitude", "POST", { text: item.text });
    showMsg("Saved 🌸");
  }

  // ── Goals ──────────────────────────────────────────────────────────────
  async function addGoal() {
    if (!goalText.trim()) return;
    const g = {
      id: Date.now(),
      text: goalText.trim(),
      done: false,
      date: fmt(Date.now()),
    };
    const upd = [g, ...goals];
    setGoals(upd);
    sl("go", upd);
    setGoalText("");
    if (dbMode) await callAPI("/goals", "POST", { text: g.text });
    showMsg("Goal added ✓");
  }
  async function toggleGoal(id) {
    const upd = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setGoals(upd);
    sl("go", upd);
    if (dbMode) await callAPI(`/goals/${id}/toggle`, "PATCH");
  }
  function delGoal(id) {
    const upd = goals.filter((g) => g.id !== id);
    setGoals(upd);
    sl("go", upd);
  }

  // ── Clinical Notes ─────────────────────────────────────────────────────
  function addNote() {
    if (!noteText.trim()) return;
    const n = {
      id: Date.now(),
      text: noteText.trim(),
      type: noteType,
      date: fmt(Date.now()),
    };
    const upd = [n, ...notes];
    setNotes(upd);
    sl("no", upd);
    setNoteText("");
    showMsg("Note saved ✓");
  }

  // ── AI Report ──────────────────────────────────────────────────────────
  async function generateReport() {
    setReportLoading(true);
    setReport("");
    setReportError("");

    const asmtSummary = Object.entries(scores).length
      ? Object.entries(scores)
          .map(([type, data]) => {
            const a = ASSESSMENTS[type];
            return `${a?.full || type}:\n  Score: ${data.score}/${a?.max || "?"}\n  Severity: ${data.result}\n  Recommended Action: ${data.action || "—"}\n  Date Taken: ${data.date}`;
          })
          .join("\n\n")
      : "No standardized assessments completed yet.";

    const recentJournal =
      entries
        .slice(0, 15)
        .map(
          (e, i) =>
            `Entry ${i + 1} — ${e.date} | Mood: ${e.mood} (${MOOD_LABELS[e.mood] || e.mood}) | Category: ${e.tag || "General"}\n"${e.text}"`,
        )
        .join("\n\n---\n\n") || "No journal entries recorded.";

    const grSummary =
      grList
        .slice(0, 8)
        .map((g) => `• ${g.text} (${g.date})`)
        .join("\n") || "None recorded.";

    const goalsSummary = goals.length
      ? goals.map((g) => `[${g.done ? "✓" : "○"}] ${g.text}`).join("\n")
      : "No goals set.";

    const moodFreq =
      Object.entries(
        entries.reduce((acc, e) => {
          acc[MOOD_LABELS[e.mood] || e.mood] =
            (acc[MOOD_LABELS[e.mood] || e.mood] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([m, c]) => `${m}: ${c}x`)
        .join(", ") || "No data";

    const prompt = `You are an expert clinical psychologist conducting a comprehensive, evidence-based mental health assessment. Produce a detailed, professional clinical report in the following exact structured format. Be specific, thorough, and directly reference the patient's actual data — never be generic.

═══════════════════════════════════════════
PATIENT DATA
═══════════════════════════════════════════
Patient: ${un}
Report Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Total Journal Entries: ${entries.length}
Journal Streak: ${calcStreak(entries)} days
Most Frequent Moods: ${moodFreq}
Assessments Completed: ${Object.keys(scores).length}

STANDARDIZED ASSESSMENT RESULTS:
${asmtSummary}

RECENT JOURNAL ENTRIES (${Math.min(entries.length, 15)} most recent):
${recentJournal}

GRATITUDE LOG:
${grSummary}

WELLNESS GOALS:
${goalsSummary}

═══════════════════════════════════════════
REQUIRED REPORT STRUCTURE
═══════════════════════════════════════════
Please write each section below. Use **Section Title** on its own line to mark each section.

**Executive Summary**
3-5 sentences. Overall mental health status, primary concerns, notable strengths, and immediate recommendations. Be direct and clinically precise.

**Assessment Score Analysis**
For EACH completed assessment, analyze: what the score indicates clinically, whether it's consistent with the journal data, any discrepancies to note, and trajectory concerns. If multiple assessments exist, discuss comorbidities and how scores interact.

**Psycholinguistic Journal Analysis**
Analyze the journal entries systematically: dominant emotional themes, cognitive distortions present (catastrophizing, mind reading, all-or-nothing thinking, etc.), emotional regulation patterns, linguistic markers of depression/anxiety/stress, mood variability across entries, and any concerning escalating patterns.

**Strengths & Protective Factors**
Identify specific evidence of resilience, positive coping strategies, social support indicators, self-awareness, and any growth patterns visible in the data.

**Risk Stratification**
Current risk level: Low / Moderate / High / Critical. Specific factors elevating or reducing risk. Any immediate safety concerns. Be clinical but compassionate.

**Evidence-Based Recommendations**
8-10 specific, actionable recommendations. For each, reference the specific data point that justifies it. Include:
- Therapeutic modalities (CBT, DBT, ACT, etc.) with rationale
- Lifestyle interventions with evidence base
- Specific techniques for identified cognitive patterns
- Professional referral criteria
- Timeline and priority (immediate/short-term/long-term)

**Personalized 30-Day Action Plan**
Week 1: [3-4 specific daily actions]
Week 2: [3-4 specific actions building on week 1]
Week 3: [3-4 specific actions]
Week 4: [Review, consolidation, and forward planning]
Each action should directly address the patient's specific scores and journal patterns.

**Clinical Impressions**
Professional clinical impression paragraph — as would appear in an actual clinical record. Use appropriate clinical language.

**Clinical Disclaimer**
Standard disclaimer about AI limitations and the necessity of consulting a licensed mental health professional.

Write comprehensively. Each section should be substantive (minimum 150 words). Reference specific scores, specific journal quotes, and specific patterns throughout.`;

    try {
      const text = await callClaude(prompt, 3000);
      if (!text || text.trim().length < 100)
        throw new Error(
          "Report was generated but appears empty. This may indicate an API configuration issue.",
        );
      setReport(text);
      sls("rep", text);
      if (dbMode) await callAPI("/report", "POST", { content: text });
      showMsg("Clinical report generated ✓");
    } catch (err) {
      const msg =
        err.message === "MISSING_KEY"
          ? "API key not configured. Add VITE_ANTHROPIC_KEY to your Netlify environment variables."
          : err.message.includes("401")
            ? "Invalid API key. Check your VITE_ANTHROPIC_KEY value at console.anthropic.com."
            : err.message.includes("429")
              ? "Rate limit reached. Wait a moment and try again."
              : err.message;
      setReportError(msg);
      showMsg("❌ " + msg.slice(0, 60));
    }
    setReportLoading(false);
  }

  // ── AI Chat ────────────────────────────────────────────────────────────
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const q = chatInput.trim();
    setChatInput("");
    const upd = [...chatMsgs, userMsg];
    setChatMsgs(upd);
    setChatLoading(true);

    const context = `You are a compassionate mental health support AI. The patient's data:
Assessments: ${
      Object.entries(scores)
        .map(([k, v]) => `${k.toUpperCase()}=${v.score}(${v.result})`)
        .join(", ") || "none"
    }
Recent mood: ${
      entries
        .slice(0, 3)
        .map((e) => e.mood)
        .join(" ") || "unknown"
    }
Journal entries: ${entries.length}, Streak: ${calcStreak(entries)} days
Current goals: ${
      goals
        .filter((g) => !g.done)
        .map((g) => g.text)
        .join("; ") || "none set"
    }

User question: ${q}

Respond with empathy, evidence-based information, and practical suggestions. Be warm but professionally grounded. If discussing clinical matters, recommend professional consultation. Keep responses focused and helpful.`;

    try {
      const reply = await callClaude(context, 800);
      const msgs = [...upd, { role: "assistant", content: reply }];
      setChatMsgs(msgs);
      sl("ch", msgs);
    } catch (err) {
      const errMsg =
        err.message === "MISSING_KEY"
          ? "Please add your API key (VITE_ANTHROPIC_KEY) to use the AI chat."
          : "Failed to get response: " + err.message;
      const msgs = [...upd, { role: "assistant", content: errMsg }];
      setChatMsgs(msgs);
      sl("ch", msgs);
    }
    setChatLoading(false);
  }

  // ── PDF Export ─────────────────────────────────────────────────────────
  function exportPDF() {
    showMsg("Generating PDF…");
    const ex = document.getElementById("jspdf-s");
    if (ex) {
      buildPDF();
      return;
    }
    const s = document.createElement("script");
    s.id = "jspdf-s";
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = buildPDF;
    document.head.appendChild(s);
  }

  function buildPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth(),
      H = doc.internal.pageSize.getHeight();
    const M = 18,
      UW = W - M * 2;
    let y = M;
    const ck = (n = 10) => {
      if (y + n > H - M) {
        doc.addPage();
        y = M;
      }
    };
    const st = (t, c = [59, 91, 219]) => {
      ck(14);
      doc.setFillColor(...c);
      doc.rect(M, y, UW, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(t, M + 3, y + 5);
      doc.setTextColor(28, 26, 22);
      y += 11;
    };
    const bt = (txt, sz = 9, c = [55, 52, 48]) => {
      doc.setFontSize(sz);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...c);
      doc.splitTextToSize(String(txt || ""), UW).forEach((l) => {
        ck(6);
        doc.text(l, M, y);
        y += 5;
      });
    };

    // Cover
    doc.setFillColor(59, 91, 219);
    doc.rect(0, 0, W, 60, "F");
    doc.setFillColor(112, 72, 232);
    doc.rect(0, 46, W, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("MindTracker", M, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Mental Health Assessment Report", M, 32);
    doc.setFontSize(8.5);
    doc.text(
      `Patient: ${un}  |  Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      M,
      50,
    );
    doc.text(
      `Data mode: ${dbMode ? "Cloud (MySQL)" : "Local storage"}  |  Entries: ${entries.length}  |  Streak: ${calcStreak(entries)} days`,
      M,
      57,
    );
    doc.setTextColor(28, 26, 22);
    y = 70;

    if (Object.keys(scores).length) {
      st("ASSESSMENT RESULTS");
      Object.entries(scores).forEach(([type, d]) => {
        const a = ASSESSMENTS[type];
        bt(
          `${a?.full || type}  ·  Score: ${d.score}/${a?.max || "?"}  ·  Result: ${d.result}  ·  Date: ${d.date}`,
        );
        if (d.action) bt(`  → ${d.action}`, 8.5, [100, 95, 90]);
        y += 1;
      });
      y += 4;
    }

    if (report) {
      st("AI CLINICAL REPORT");
      bt(report.replace(/\*\*/g, "").replace(/#{1,3}\s/g, ""), 9, [40, 38, 35]);
      y += 4;
    }

    st("JOURNAL ENTRIES");
    if (!entries.length) bt("No journal entries recorded.");
    else
      entries.forEach((e, i) => {
        ck(18);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 91, 219);
        doc.text(
          `${i + 1}. ${e.date}  ${e.mood}  [${e.tag || "General"}]`,
          M,
          y,
        );
        doc.setTextColor(28, 26, 22);
        y += 5;
        bt(e.text);
        y += 2;
        doc.setDrawColor(200, 198, 194);
        doc.line(M, y, W - M, y);
        y += 4;
      });

    if (grList.length) {
      st("GRATITUDE LOG", [12, 166, 120]);
      grList
        .slice(0, 20)
        .forEach((g, i) => bt(`${i + 1}. [${g.date}] ${g.text}`));
      y += 4;
    }
    if (goals.length) {
      st("WELLNESS GOALS", [25, 110, 200]);
      goals.forEach((g, i) =>
        bt(`${i + 1}. [${g.done ? "✓" : " "}] ${g.text}`),
      );
      y += 4;
    }
    if (notes.length) {
      st("CLINICAL NOTES", [130, 80, 180]);
      notes
        .slice(0, 20)
        .forEach((n, i) => bt(`${i + 1}. [${n.date}][${n.type}] ${n.text}`));
      y += 4;
    }

    const tp = doc.internal.getNumberOfPages();
    for (let i = 1; i <= tp; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(150, 146, 140);
      doc.text(
        `MindTracker — Confidential Assessment Report — Page ${i} of ${tp}  |  ${un}`,
        M,
        H - 8,
      );
    }
    doc.save(`MindTracker_${un}_${new Date().toISOString().slice(0, 10)}.pdf`);
    showMsg("PDF downloaded ✓");
  }

  // ── Derived stats ──────────────────────────────────────────────────────
  const streak = calcStreak(entries);
  const thisWeek = entries.filter(
    (e) => Date.now() - e.timestamp < 7 * 86400000,
  ).length;
  const moodFreq = Object.entries(
    entries.reduce((a, e) => {
      a[e.mood] = (a[e.mood] || 0) + 1;
      return a;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const topMood = moodFreq[0]?.[0] || "—";
  const doneGoals = goals.filter((g) => g.done).length;
  const wellScore = Object.keys(scores).length
    ? Math.max(
        0,
        Math.round(
          100 -
            (Object.values(scores).reduce((a, s) => a + (s.level || 0), 0) /
              Object.keys(scores).length) *
              25,
        ),
      )
    : null;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "journal", label: "Journal", icon: "📓" },
    { id: "assessments", label: "Assessments", icon: "🧪" },
    { id: "report", label: "AI Report", icon: "🤖" },
    { id: "chat", label: "AI Chat", icon: "💬" },
    { id: "gratitude", label: "Gratitude", icon: "🌸" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "notes", label: "Notes", icon: "📋" },
    { id: "history", label: "History", icon: "📈" },
  ];

  // ══════════════════════════════════════════════════════════════════════
  // AUTH SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (!user)
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <Logo size={52} />
            <div className="auth-brand-text">
              <div className="auth-app-name">MindTracker</div>
              <div className="auth-app-sub">
                Clinical Mental Wellness Platform
              </div>
            </div>
          </div>
          <div className="auth-features">
            {[
              "PHQ-9 · GAD-7 · PSS · ISI · MBI · DASS-21",
              "AI Clinical Report & Pattern Analysis",
              "Secure journal with crisis detection",
              "MySQL cloud sync + offline mode",
            ].map((f, i) => (
              <div key={i} className="auth-feature">
                <span className="auth-feature-dot" /> {f}
              </div>
            ))}
          </div>
          <div className="auth-form">
            {isSignup && (
              <div className="field">
                <label>Email (optional)</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={fmE}
                  onChange={(e) => setFmE(e.target.value)}
                />
              </div>
            )}
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={fmU}
                onChange={(e) => setFmU(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && document.getElementById("pw")?.focus()
                }
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                id="pw"
                type="password"
                placeholder="••••••••"
                value={fmP}
                onChange={(e) => setFmP(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doAuth()}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={doAuth}
              disabled={authBusy}
            >
              {authBusy
                ? "Please wait…"
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </button>
            <span
              className="auth-toggle"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </span>
          </div>
          <div className="auth-note">
            {dbMode
              ? "☁ Database connected"
              : "💾 Using local storage (set VITE_API_BASE for DB sync)"}
          </div>
        </div>
        <Toast msg={toast} />
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="app">
      {/* Header */}
      <header className="hdr">
        <div className="hdr-left">
          <Logo size={28} />
          <div className="hdr-brand">
            <span className="hdr-name">MindTracker</span>
            <span className="hdr-mode">{dbMode ? "☁ Cloud" : "💾 Local"}</span>
          </div>
        </div>
        <div className="hdr-right">
          <button
            className="hdr-btn"
            title="Breathing exercise"
            onClick={() => setShowBreath(true)}
          >
            🌬
          </button>
          <button
            className="hdr-btn"
            onClick={() => setDark(!dark)}
            title="Toggle theme"
          >
            {dark ? "☀" : "◑"}
          </button>
          <button className="hdr-btn" onClick={exportPDF} title="Export PDF">
            ⬇
          </button>
          <a
            className="hdr-btn"
            href="https://www.google.com/maps/search/mental+health+therapist+near+me"
            target="_blank"
            rel="noreferrer"
            title="Find Help"
          >
            🏥
          </a>
          <div className="user-chip">
            <div className="user-ava">{un[0]?.toUpperCase()}</div>
            <span className="user-nm">{un}</span>
            <button className="user-out" onClick={logout} title="Sign out">
              ↩
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tabbtn${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-ico">{t.icon}</span>
            <span className="tab-lbl">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="content">
          {/* ════ DASHBOARD ════ */}
          {tab === "dashboard" && (
            <div>
              <div className="pg-head">
                <h1>
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "morning"
                    : new Date().getHours() < 17
                      ? "afternoon"
                      : "evening"}
                  , {un}
                </h1>
                <p className="pg-sub">
                  Your mental wellness overview ·{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="kpi-grid">
                {[
                  {
                    icon: "📝",
                    val: entries.length,
                    lbl: "Total Entries",
                    cls: "",
                  },
                  {
                    icon: "🔥",
                    val: `${streak}d`,
                    lbl: "Current Streak",
                    cls: "kpi-accent",
                  },
                  { icon: "📅", val: thisWeek, lbl: "This Week", cls: "" },
                  { icon: "😊", val: topMood, lbl: "Top Mood", cls: "" },
                  {
                    icon: "🎯",
                    val: `${doneGoals}/${goals.length || 0}`,
                    lbl: "Goals Done",
                    cls: "",
                  },
                  ...(wellScore !== null
                    ? [
                        {
                          icon: "💚",
                          val: `${wellScore}%`,
                          lbl: "Wellness Index",
                          cls: "kpi-well",
                        },
                      ]
                    : []),
                ].map((k, i) => (
                  <div key={i} className={`kpi ${k.cls}`}>
                    <div className="kpi-icon">{k.icon}</div>
                    <div className="kpi-val">{k.val}</div>
                    <div className="kpi-lbl">{k.lbl}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>7-Day Mood Calendar</h3>
                </div>
                <MoodWeek entries={entries} />
              </div>

              {Object.keys(scores).length > 0 && (
                <div className="card">
                  <div className="card-head">
                    <h3>Assessment Results</h3>
                    <span className="card-meta">Latest scores</span>
                  </div>
                  <div className="scores-list">
                    {ASSESS_ORDER.filter((k) => scores[k]).map((k) => {
                      const s = scores[k],
                        a = ASSESSMENTS[k];
                      return (
                        <div key={k} className="score-row">
                          <div className="score-row-l">
                            <span className="score-ico">{a.icon}</span>
                            <div>
                              <div className="score-nm">{a.name}</div>
                              <div className="score-dt">{s.date}</div>
                            </div>
                          </div>
                          <div className="score-row-r">
                            <Sev level={s.level || 0} label={s.result} />
                            <span className="score-pt">
                              {s.score}/{a.max}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="quick-grid">
                {[
                  ["✏️ Write Entry", "journal"],
                  ["🧪 Take Assessment", "assessments"],
                  ["🤖 AI Report", "report"],
                  ["💬 AI Chat", "chat"],
                  ["🌸 Gratitude", "gratitude"],
                  ["🎯 Set Goals", "goals"],
                ].map(([lbl, tid]) => (
                  <button
                    key={tid}
                    className="quick-card"
                    onClick={() => setTab(tid)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════ JOURNAL ════ */}
          {tab === "journal" && (
            <div>
              <div className="pg-head">
                <h1>Journal</h1>
                <p className="pg-sub">
                  {entries.length} entries · {streak} day streak
                </p>
              </div>
              <div className="card">
                <div className="card-head">
                  <h3>New Entry</h3>
                </div>
                <div className="journal-form">
                  <div className="jf-row">
                    <div className="jf-col">
                      <p className="field-lbl">How are you feeling?</p>
                      <div className="mood-grid">
                        {MOODS.map((m) => (
                          <button
                            key={m}
                            className={`mood-chip${m === jMood ? " sel" : ""}`}
                            onClick={() => setJMood(m)}
                            title={MOOD_LABELS[m]}
                          >
                            <span>{m}</span>
                            <span className="mood-chip-lbl">
                              {MOOD_LABELS[m]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="jf-col-sm">
                      <p className="field-lbl">Category</p>
                      <div className="tag-grid">
                        {TAGS.map((t) => (
                          <button
                            key={t}
                            className={`tag-chip${jTag === t ? " sel" : ""}`}
                            onClick={() => setJTag(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    className="jtarea"
                    placeholder="Write freely — this is your private, secure space. What's on your mind today?"
                    value={jText}
                    onChange={(e) => setJText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                        addEntry();
                    }}
                  />
                  <div className="jtarea-foot">
                    <span className="char-ct">
                      {jText.length} chars · Ctrl+Enter to save
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={addEntry}
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="sec-head">Past Entries ({entries.length})</h3>
              {entries.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">📓</div>
                  <p>No entries yet. Start writing above.</p>
                </div>
              ) : (
                entries.map((e) => (
                  <div key={e.id} className="entry-card">
                    <div className="entry-head">
                      <div className="entry-meta">
                        <span className="entry-mood">{e.mood}</span>
                        <span className="entry-date">{e.date}</span>
                        <span className="entry-tag">{e.tag || "General"}</span>
                      </div>
                      <button
                        className="del-btn"
                        onClick={() => delEntry(e.id)}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="entry-body">{e.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ ASSESSMENTS ════ */}
          {tab === "assessments" && (
            <div>
              <div className="pg-head">
                <h1>Clinical Assessments</h1>
                <p className="pg-sub">
                  Standardized, validated screening tools used in clinical
                  practice worldwide
                </p>
              </div>
              <div className="asmt-grid">
                {ASSESS_ORDER.map((k) => {
                  const a = ASSESSMENTS[k],
                    s = scores[k];
                  return (
                    <div
                      key={k}
                      className="asmt-card"
                      style={{ "--ac": a.color, "--ab": a.bg }}
                    >
                      <div className="asmt-card-head">
                        <span className="asmt-card-ico">{a.icon}</span>
                        <div>
                          <div className="asmt-card-name">{a.name}</div>
                          <div className="asmt-card-full">{a.full}</div>
                        </div>
                      </div>
                      <p className="asmt-card-desc">{a.desc}</p>
                      <div className="asmt-card-meta">
                        <span>⏱ {a.timeframe}</span>
                        <span>
                          {a.questions.length} questions · max {a.max}
                        </span>
                      </div>
                      {s && (
                        <div className="asmt-card-result">
                          <Sev level={s.level || 0} label={s.result} />
                          <span className="asmt-card-score">
                            {s.score}/{a.max} · {s.date}
                          </span>
                          <Bar
                            val={s.score}
                            max={a.max}
                            color={SEV_COLORS[s.level || 0]}
                          />
                        </div>
                      )}
                      <button
                        className="btn btn-sm asmt-btn"
                        style={{ background: a.color, borderColor: a.color }}
                        onClick={() => setActiveAsmt(a)}
                      >
                        {s ? "↺ Retake" : "▶ Start Assessment"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════ AI REPORT ════ */}
          {tab === "report" && (
            <div>
              <div className="pg-head">
                <h1>AI Clinical Report</h1>
                <p className="pg-sub">
                  Powered by Anthropic Claude · Comprehensive analysis of all
                  your mental health data
                </p>
              </div>
              <ReportPanel
                report={report}
                loading={reportLoading}
                error={reportError}
                onGenerate={generateReport}
                hasData={entries.length > 0 || Object.keys(scores).length > 0}
              />
            </div>
          )}

          {/* ════ AI CHAT ════ */}
          {tab === "chat" && (
            <div>
              <div className="pg-head">
                <h1>AI Support Chat</h1>
                <p className="pg-sub">
                  Talk to an AI mental health support assistant — context-aware
                  of your data
                </p>
              </div>
              <div className="chat-panel">
                <div className="chat-msgs">
                  {chatMsgs.length === 0 && (
                    <div className="chat-welcome">
                      <div className="chat-welcome-ico">💬</div>
                      <h3>Hello, {un}</h3>
                      <p>
                        I'm here to support you. Ask me anything about mental
                        wellness, coping strategies, or what your assessment
                        scores mean. I can see your data and provide
                        personalized guidance.
                      </p>
                      <div className="chat-suggestions">
                        {[
                          "What do my assessment scores mean?",
                          "Give me coping strategies for anxiety",
                          "How can I improve my sleep?",
                          "Explain CBT techniques for me",
                        ].map((s, i) => (
                          <button
                            key={i}
                            className="chat-suggest"
                            onClick={() => {
                              setChatInput(s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMsgs.map((m, i) => (
                    <div key={i} className={`chat-msg ${m.role}`}>
                      <div className="chat-bubble">
                        {m.content.split("\n").map((line, j) => {
                          if (!line.trim()) return null;
                          if (line.match(/^\*\*(.*)\*\*$/))
                            return (
                              <strong
                                key={j}
                                style={{
                                  display: "block",
                                  marginTop: "0.5rem",
                                }}
                              >
                                {line.replace(/\*\*/g, "")}
                              </strong>
                            );
                          return (
                            <p key={j} style={{ marginBottom: "0.3rem" }}>
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-msg assistant">
                      <div className="chat-bubble chat-thinking">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    placeholder="Type your message…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendChat()
                    }
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ GRATITUDE ════ */}
          {tab === "gratitude" && (
            <div>
              <div className="pg-head">
                <h1>Gratitude Log 🌸</h1>
                <p className="pg-sub">
                  Daily gratitude practice reduces depression and increases
                  wellbeing (Emmons & McCullough, 2003)
                </p>
              </div>
              <div className="card">
                <textarea
                  className="jtarea"
                  style={{ minHeight: "90px" }}
                  placeholder="Today I am grateful for…"
                  value={grText}
                  onChange={(e) => setGrText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      addGratitude();
                  }}
                />
                <div className="jtarea-foot">
                  <span className="char-ct">Ctrl+Enter to save</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={addGratitude}
                  >
                    Add Entry
                  </button>
                </div>
              </div>
              {grList.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">🌸</div>
                  <p>Begin your gratitude practice above.</p>
                </div>
              ) : (
                grList.map((g) => (
                  <div key={g.id} className="entry-card gratitude-entry">
                    <div className="entry-head">
                      <div className="entry-meta">
                        <span className="entry-mood">🌸</span>
                        <span className="entry-date">{g.date}</span>
                      </div>
                      <button
                        className="del-btn"
                        onClick={() => {
                          const u = grList.filter((x) => x.id !== g.id);
                          setGrList(u);
                          sl("gr", u);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="entry-body">{g.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ GOALS ════ */}
          {tab === "goals" && (
            <div>
              <div className="pg-head">
                <h1>Wellness Goals 🎯</h1>
                <p className="pg-sub">
                  {doneGoals} of {goals.length} goals completed
                </p>
              </div>
              <div className="card">
                <div className="goal-input-row">
                  <input
                    className="goal-input"
                    placeholder="Add a wellness goal, e.g. Meditate 10 minutes daily…"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  />
                  <button className="btn btn-primary btn-sm" onClick={addGoal}>
                    Add
                  </button>
                </div>
              </div>
              {goals.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">🎯</div>
                  <p>Set your first wellness goal above.</p>
                </div>
              ) : (
                goals.map((g) => (
                  <div
                    key={g.id}
                    className={`goal-item${g.done ? " done" : ""}`}
                  >
                    <button
                      className="goal-chk"
                      onClick={() => toggleGoal(g.id)}
                    >
                      {g.done && "✓"}
                    </button>
                    <div className="goal-body">
                      <span className="goal-txt">{g.text}</span>
                      <span className="goal-date">{g.date}</span>
                    </div>
                    <button className="del-btn" onClick={() => delGoal(g.id)}>
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ CLINICAL NOTES ════ */}
          {tab === "notes" && (
            <div>
              <div className="pg-head">
                <h1>Clinical Notes 📋</h1>
                <p className="pg-sub">
                  Professional observations, session notes, and clinical
                  reflections
                </p>
              </div>
              <div className="card">
                <div className="notes-type-row">
                  {[
                    "Observation",
                    "Concern",
                    "Progress",
                    "Insight",
                    "Goal",
                    "Other",
                  ].map((t) => (
                    <button
                      key={t}
                      className={`note-type-btn${noteType === t ? " sel" : ""}`}
                      onClick={() => setNoteType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  className="jtarea"
                  placeholder={`Write a ${noteType.toLowerCase()}…`}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      addNote();
                  }}
                />
                <div className="jtarea-foot">
                  <span className="char-ct">Ctrl+Enter to save</span>
                  <button className="btn btn-primary btn-sm" onClick={addNote}>
                    Save Note
                  </button>
                </div>
              </div>
              {notes.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">📋</div>
                  <p>No notes yet. Add clinical observations above.</p>
                </div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="entry-card">
                    <div className="entry-head">
                      <div className="entry-meta">
                        <span className="note-type-badge">{n.type}</span>
                        <span className="entry-date">{n.date}</span>
                      </div>
                      <button
                        className="del-btn"
                        onClick={() => {
                          const u = notes.filter((x) => x.id !== n.id);
                          setNotes(u);
                          sl("no", u);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="entry-body">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {tab === "history" && (
            <div>
              <div className="pg-head">
                <h1>Assessment History 📈</h1>
                <p className="pg-sub">
                  Track your progress over time · {asmtHistory.length} records
                </p>
              </div>
              {asmtHistory.length === 0 ? (
                <div className="empty">
                  <div className="empty-ico">📈</div>
                  <p>Complete assessments to track your progress over time.</p>
                </div>
              ) : (
                <>
                  {/* Group by type */}
                  {ASSESS_ORDER.filter((k) =>
                    asmtHistory.some((h) => h.type === k),
                  ).map((k) => {
                    const a = ASSESSMENTS[k];
                    const hist = asmtHistory.filter((h) => h.type === k);
                    return (
                      <div key={k} className="card hist-card">
                        <div className="card-head">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".5rem",
                            }}
                          >
                            <span>{a.icon}</span>
                            <h3>{a.full}</h3>
                          </div>
                          <span className="card-meta">
                            {hist.length} records
                          </span>
                        </div>
                        <div className="hist-list">
                          {hist.map((h, i) => (
                            <div key={i} className="hist-row">
                              <span className="hist-date">{h.date}</span>
                              <Bar
                                val={h.score}
                                max={a.max}
                                color={SEV_COLORS[h.level || 0]}
                                height={6}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: ".5rem",
                                  minWidth: 160,
                                }}
                              >
                                <Sev level={h.level || 0} label={h.result} />
                                <span className="hist-score">
                                  {h.score}/{a.max}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {activeAsmt && (
        <AssessmentModal
          asmt={activeAsmt}
          onClose={() => setActiveAsmt(null)}
          onSave={saveScore}
        />
      )}
      {showBreath && <BreathingModal onClose={() => setShowBreath(false)} />}
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}
      <Toast msg={toast} />
    </div>
  );
}
