"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    const updated = [...messages, { role: "user" as const, content: text }];
    setMessages(updated);
    setIsLoading(true);

    // Only send the last 10 messages to keep request size manageable
    const recentMessages = updated.slice(-10);

    const attemptFetch = () => fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ messages: recentMessages }),
    });

    try {
      let res = await attemptFetch();
      // If it fails, wait 2 seconds and retry once automatically
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 2000));
        res = await attemptFetch();
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content ?? "Sorry, something went wrong!" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Couldn't reach the assistant. Check your internet and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Photo Assistant"
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          width: "52px", height: "52px",
          backgroundColor: "#6ee7b7",
          border: "none", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(110,231,183,0.2)",
          transition: "transform 0.2s",
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091412" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091412" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 40,
          width: "340px",
          backgroundColor: "#0f1e1c",
          border: "1px solid #1a3530",
          borderRadius: "16px",
          display: "flex", flexDirection: "column",
          height: "480px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            backgroundColor: "#0d1a18",
            borderBottom: "1px solid #1a3530",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px",
              backgroundColor: "#6ee7b7", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#091412" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#e8f8f2" }}>Photo Assistant</p>
              <p style={{ margin: 0, fontSize: "11px", color: "#5a9e8e" }}>Ask me anything about your D60</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                title="Clear chat"
                style={{
                  background: "none", border: "none",
                  color: "#3a7a6a", fontSize: "11px",
                  cursor: "pointer", padding: "4px 8px",
                  borderRadius: "6px",
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <p style={{ color: "#3a7a6a", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  Hey! Ask me anything about your Nikon D60, your lenses, or photography in general 📷
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "9px 13px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  backgroundColor: m.role === "user" ? "#6ee7b7" : "#1a3530",
                  color: m.role === "user" ? "#091412" : "#a8d4c4",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ backgroundColor: "#1a3530", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", gap: "5px" }}>
                  {[0, 150, 300].map(d => (
                    <span key={d} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      backgroundColor: "#5a9e8e",
                      display: "inline-block",
                      animation: `bounce 1s ${d}ms infinite`,
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid #1a3530",
            backgroundColor: "#0d1a18",
            display: "flex", gap: "8px",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              style={{
                flex: 1, padding: "9px 12px",
                backgroundColor: "#0f1e1c",
                border: "1px solid #1a3530",
                borderRadius: "10px",
                color: "#a8d4c4",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: "36px", height: "36px",
                backgroundColor: "#6ee7b7",
                border: "none", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                opacity: input.trim() && !isLoading ? 1 : 0.4,
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091412" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-5px); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
