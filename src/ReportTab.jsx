import { useState, useEffect } from "react";
import { api, generateAIReport } from "./api";

export default function ReportTab() {
  const [report, setReport] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getReport()
      .then((d) => {
        if (d.data) {
          setReport(d.data.content);
          setSavedAt(
            new Date(d.data.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      // Gather data in parallel
      const [journalRes, scoresRes, gratitudeRes, goalsRes] =
        await Promise.allSettled([
          api.getJournal(),
          api.getScores(),
          api.getGratitude(),
          api.getGoals(),
        ]);

      const journal =
        journalRes.status === "fulfilled" ? journalRes.value.data || [] : [];
      const scores =
        scoresRes.status === "fulfilled" ? scoresRes.value.data || [] : [];
      const gratitude =
        gratitudeRes.status === "fulfilled"
          ? gratitudeRes.value.data || []
          : [];
      const goals =
        goalsRes.status === "fulfilled" ? goalsRes.value.data || [] : [];

      const text = await generateAIReport(journal, scores, gratitude, goals);
      setReport(text);
      setSavedAt(
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      );

      // Save to backend
      api.saveReport(text).catch(() => {});
    } catch (e) {
      setError(
        e.message || "Failed to generate report. Check your API key in .env",
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px 0",
      }}
    >
      {/* Header */}
      <div
        className="fade-in"
        style={{
          background:
            "linear-gradient(135deg, var(--surface) 0%, rgba(176,109,255,0.08) 100%)",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid var(--border)",
          flexShrink: 0,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Playfair Display",
                fontSize: 20,
                marginBottom: 6,
              }}
            >
              AI Wellness Report
            </h2>
            <p style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.5 }}>
              Personalized insights based on your journal, assessments,
              gratitude & goals.
            </p>
            {savedAt && (
              <p
                style={{
                  color: "var(--accent)",
                  fontSize: 11,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                Last generated: {savedAt}
              </p>
            )}
          </div>
          <div style={{ fontSize: 40, flexShrink: 0 }}>🤖</div>
        </div>

        <button
          onClick={generate}
          disabled={generating}
          style={{
            marginTop: 16,
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: generating
              ? "var(--surface3)"
              : "linear-gradient(135deg, var(--accent2), var(--accent))",
            color: "#fff",
            boxShadow: generating ? "none" : "0 4px 20px var(--accent-glow)",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {generating ? (
            <>
              <span className="spin" style={{ display: "inline-block" }}>
                ⟳
              </span>
              Generating your report…
            </>
          ) : (
            `${report ? "↻ Regenerate" : "✨ Generate"} Report`
          )}
        </button>

        {error && (
          <div
            style={{
              marginTop: 12,
              background: "rgba(244,112,104,0.1)",
              border: "1px solid rgba(244,112,104,0.3)",
              color: "var(--red)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
            }}
          >
            ⚠️ {error}
            {error.includes("API key") && (
              <p style={{ marginTop: 6, opacity: 0.8 }}>
                Add VITE_ANTHROPIC_API_KEY to your .env file. Get a free key at
                console.anthropic.com
              </p>
            )}
          </div>
        )}
      </div>

      {/* Report content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {!loaded ? (
          <LoadingSkeleton />
        ) : generating ? (
          <LoadingSkeleton animated />
        ) : report ? (
          <div
            className="fade-in"
            style={{
              background: "var(--surface)",
              borderRadius: 20,
              padding: "24px",
              border: "1px solid var(--border)",
            }}
          >
            <ReportText text={report} />
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48 }}>✨</div>
            <p
              style={{
                color: "var(--text3)",
                fontSize: 14,
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              Generate your first AI wellness report to get personalized
              insights based on all your tracked data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportText({ text }) {
  const paragraphs = text.split("\n").filter((p) => p.trim());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            color: "var(--text)",
            lineHeight: 1.8,
            borderLeft: i === 0 ? "3px solid var(--accent)" : "none",
            paddingLeft: i === 0 ? 16 : 0,
          }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}

function LoadingSkeleton({ animated }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 20,
        padding: "24px",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {[90, 75, 100, 60, 85, 70, 95].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 7,
            width: `${w}%`,
            background: "var(--surface2)",
            opacity: animated ? undefined : 0.5,
            ...(animated
              ? { animation: `pulse 1.4s ease-in-out ${i * 0.12}s infinite` }
              : {}),
          }}
        />
      ))}
    </div>
  );
}
