import { useState, useEffect } from "react";
import AuthScreen from "./AuthScreen";
import JournalTab from "./JournalTab";
import AssessmentsTab from "./AssessmentsTab";
import WellnessTab from "./WellnessTab";
import ReportTab from "./ReportTab";

const TABS = [
  { key: "journal", label: "Journal", icon: "📝" },
  { key: "assess", label: "Assess", icon: "📊" },
  { key: "wellness", label: "Wellness", icon: "🌱" },
  { key: "report", label: "AI Report", icon: "🤖" },
];

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mt_user"));
    } catch {
      return null;
    }
  });
  const [tab, setTab] = useState("journal");
  const [showProfile, setShowProfile] = useState(false);

  // Validate token still exists
  useEffect(() => {
    if (user && !localStorage.getItem("mt_token")) setUser(null);
  }, [user]);

  function logout() {
    localStorage.removeItem("mt_token");
    localStorage.removeItem("mt_user");
    setUser(null);
    setShowProfile(false);
  }

  if (!user) return <AuthScreen onLogin={(u) => setUser(u)} />;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--accent2), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🧠
          </div>
          <span
            style={{
              fontFamily: "Playfair Display",
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text)",
            }}
          >
            MindTracker
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfile((p) => !p)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--surface3), var(--surface2))",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </button>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                zIndex: 100,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "6px",
                minWidth: 180,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 4,
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 13 }}>
                  @{user.username}
                </p>
                {user.email && (
                  <p
                    style={{
                      color: "var(--text3)",
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    {user.email}
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  borderRadius: 10,
                  textAlign: "left",
                  fontSize: 13,
                  color: "var(--red)",
                  background: "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "rgba(244,112,104,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Click outside to close profile */}
      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
          }}
        />
      )}

      {/* Page content */}
      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div key={tab} style={{ height: "100%", overflowY: "auto" }}>
          {tab === "journal" && <JournalTab />}
          {tab === "assess" && <AssessmentsTab />}
          {tab === "wellness" && <WellnessTab />}
          {tab === "report" && <ReportTab />}
        </div>
      </main>

      {/* Bottom nav */}
      <nav
        style={{
          display: "flex",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
          padding: "6px 4px",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 12,
              background: "transparent",
              textAlign: "center",
              transition: "all 0.18s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 20,
                display: "block",
                filter: tab === t.key ? "none" : "grayscale(0.7) opacity(0.5)",
                transition: "filter 0.2s",
              }}
            >
              {t.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? "var(--accent)" : "var(--text3)",
                transition: "color 0.2s",
              }}
            >
              {t.label}
            </span>
            {tab === t.key && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  marginTop: 1,
                }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
