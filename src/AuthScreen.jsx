import { useState } from "react";
import { api } from "./api";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await api.login(username, password);
      } else {
        data = await api.register(username, password, email);
      }
      localStorage.setItem("mt_token", data.token);
      localStorage.setItem("mt_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 60% 30%, rgba(176,109,255,0.12) 0%, transparent 65%), var(--bg)",
        padding: 24,
      }}
    >
      <div
        className="slide-up"
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface)",
          borderRadius: 24,
          border: "1px solid var(--border)",
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              margin: "0 auto 16px",
              background:
                "linear-gradient(135deg, var(--accent2), var(--accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: "0 8px 24px var(--accent-glow)",
            }}
          >
            🧠
          </div>
          <h1
            style={{
              fontFamily: "Playfair Display",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            MindTracker
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 6 }}>
            Your mental wellness companion
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "var(--surface2)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
            gap: 4,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "#fff" : "var(--text3)",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <Input
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="your_username"
          />
          {mode === "register" && (
            <Input
              label="Email (optional)"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
              type="email"
            />
          )}
          <Input
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
          />

          {error && (
            <div
              style={{
                background: "rgba(244,112,104,0.12)",
                border: "1px solid rgba(244,112,104,0.3)",
                color: "#f47068",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "13px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: loading
                ? "var(--surface3)"
                : "linear-gradient(135deg, var(--accent2), var(--accent))",
              color: "#fff",
              boxShadow: loading ? "none" : "0 4px 20px var(--accent-glow)",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "var(--text3)",
          marginBottom: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={label !== "Email (optional)"}
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
