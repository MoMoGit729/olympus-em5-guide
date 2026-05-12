"use client";

import { useState, useEffect, useRef } from "react";

const CORRECT_PASSWORD = "nikon60";
const SESSION_KEY = "nikon-d60-auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const exp = localStorage.getItem(SESSION_KEY);
    if (exp && Date.now() < parseInt(exp)) {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !authenticated) {
      inputRef.current?.focus();
    }
  }, [checked, authenticated]);

  const submit = () => {
    if (input === CORRECT_PASSWORD) {
      localStorage.setItem(SESSION_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setAuthenticated(true);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  if (!checked) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div style={{
      minHeight:       "100vh",
      backgroundColor: "#0e2420",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         "16px",
    }}>
      <div style={{
        backgroundColor: "#142e2a",
        border:          "1px solid #1a3530",
        borderRadius:    "16px",
        padding:         "40px 32px",
        width:           "100%",
        maxWidth:        "360px",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        gap:             "24px",
        animation:       "fadeIn 0.2s ease",
      }}>
        {/* Icon + title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width:           "48px",
            height:          "48px",
            backgroundColor: "#6ee7b7",
            borderRadius:    "10px",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#e8f8f2", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Nikon D60 Guide
            </div>
            <div style={{ color: "#5a9e8e", fontSize: "14px", marginTop: "2px" }}>
              Enter password to continue
            </div>
          </div>
        </div>

        {/* Input + button */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Password"
              style={{
                width:           "100%",
                padding:         "10px 40px 10px 14px",
                backgroundColor: "#0e2420",
                border:          `1px solid ${error ? "#f87171" : "#2a5048"}`,
                borderRadius:    "8px",
                color:           "#e8f8f2",
                fontSize:        "16px",
                outline:         "none",
                transition:      "border-color 0.15s",
                boxSizing:       "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position:   "absolute",
                right:      "10px",
                top:        "50%",
                transform:  "translateY(-50%)",
                background: "none",
                border:     "none",
                padding:    "2px",
                cursor:     "pointer",
                color:      "#5a9e8e",
                display:    "flex",
                alignItems: "center",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {error && (
            <div style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>
              Incorrect password. Please try again.
            </div>
          )}
          <button
            onClick={submit}
            style={{
              width:           "100%",
              padding:         "10px",
              backgroundColor: "#6ee7b7",
              color:           "#0e2420",
              border:          "none",
              borderRadius:    "8px",
              fontSize:        "15px",
              fontWeight:      600,
              cursor:          "pointer",
            }}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
