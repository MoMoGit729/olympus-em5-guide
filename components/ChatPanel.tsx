"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role:         "user" | "assistant";
  content:      string;
  imageBase64?: string;
  mediaType?:   string;
  isError?:     boolean;
}

export default function ChatPanel() {
  const [isOpen, setIsOpen]             = useState(false);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [pendingImage, setPendingImage]   = useState<{
    base64: string; mediaType: string; previewUrl: string;
  } | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingImage({
        base64:     dataUrl.split(",")[1],
        mediaType:  file.type,
        previewUrl: dataUrl,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendMessage = async () => {
    if ((!input.trim() && !pendingImage) || isLoading) return;
    const text = input.trim();
    setInput("");
    const newMsg: Message = {
      role:    "user",
      content: text,
      ...(pendingImage ? { imageBase64: pendingImage.base64, mediaType: pendingImage.mediaType } : {}),
    };
    setPendingImage(null);
    const updated = [...messages, newMsg];
    setMessages(updated);
    setIsLoading(true);

    const recentMessages = updated.filter(m => !m.isError).slice(-10);

    const attemptFetch = () => fetch("/api/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ messages: recentMessages }),
    });

    try {
      let res = await attemptFetch();
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 2000));
        res = await attemptFetch();
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content ?? "Sorry, something went wrong!", isError: !data.content }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Couldn't reach the assistant. Check your internet and try again.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const canSend = (input.trim().length > 0 || !!pendingImage) && !isLoading;

  return (
    <>
      {/* Hidden file inputs — gallery and camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: "88px", right: "24px", zIndex: 40,
          width: "min(340px, calc(100vw - 48px))",
          backgroundColor: "#142e2a",
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
            backgroundColor: "#112824",
            borderBottom: "1px solid #1a3530",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px",
              backgroundColor: "#6ee7b7", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
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
                  Hey! Ask me anything about your Nikon D60, your lenses, or photography in general. Tap the image icon to upload a photo for feedback.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "9px 13px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  backgroundColor: m.role === "user" ? "#6ee7b7" : "#1a3530",
                  color: m.role === "user" ? "#0e2420" : "#a8d4c4",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}>
                  {m.imageBase64 && (
                    <img
                      src={`data:${m.mediaType};base64,${m.imageBase64}`}
                      alt="Uploaded photo"
                      style={{
                        width: "100%", borderRadius: "8px",
                        display: "block",
                        marginBottom: m.content ? "6px" : 0,
                      }}
                    />
                  )}
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

          {/* Pending image preview */}
          {pendingImage && (
            <div style={{
              padding: "8px 12px",
              backgroundColor: "#112824",
              borderTop: "1px solid #1a3530",
            }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={pendingImage.previewUrl}
                  alt="Ready to send"
                  style={{ height: "64px", width: "auto", borderRadius: "8px", display: "block" }}
                />
                <button
                  onClick={() => setPendingImage(null)}
                  style={{
                    position: "absolute", top: "-6px", right: "-6px",
                    width: "18px", height: "18px",
                    backgroundColor: "#142e2a",
                    border: "1px solid #5a9e8e",
                    borderRadius: "50%",
                    color: "#a8d4c4",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid #1a3530",
            backgroundColor: "#112824",
            display: "flex", gap: "8px", alignItems: "center",
          }}>
            {/* Image upload button + menu */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {showUploadMenu && (
                <>
                  <div
                    onClick={() => setShowUploadMenu(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 9 }}
                  />
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0,
                    backgroundColor: "#112824",
                    border: "1px solid #1a3530",
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    minWidth: "170px",
                    zIndex: 10,
                  }}>
                    <button
                      onClick={() => { cameraInputRef.current?.click(); setShowUploadMenu(false); }}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "none", border: "none",
                        borderBottom: "1px solid #1a3530",
                        color: "#a8d4c4", fontSize: "13px",
                        textAlign: "left", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "10px",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a9e8e" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Take photo
                    </button>
                    <button
                      onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "none", border: "none",
                        color: "#a8d4c4", fontSize: "13px",
                        textAlign: "left", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "10px",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a9e8e" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      Photo library
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => setShowUploadMenu(o => !o)}
                title="Upload a photo"
                style={{
                  width: "36px", height: "36px",
                  backgroundColor: pendingImage ? "#6ee7b7" : "transparent",
                  border: `1px solid ${pendingImage ? "#6ee7b7" : "#1a3530"}`,
                  borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.15s, border 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={pendingImage ? "#0e2420" : "#5a9e8e"} strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
            </div>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={pendingImage ? "Add a question, or just hit send…" : "Ask a question…"}
              style={{
                flex: 1, minWidth: 0, padding: "9px 12px",
                boxSizing: "border-box",
                backgroundColor: "#142e2a",
                border: "1px solid #1a3530",
                borderRadius: "10px",
                color: "#a8d4c4",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              style={{
                width: "36px", height: "36px",
                backgroundColor: "#6ee7b7",
                border: "none", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: canSend ? "pointer" : "not-allowed",
                opacity: canSend ? 1 : 0.4,
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
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
