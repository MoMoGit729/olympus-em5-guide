"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role:         "user" | "assistant";
  content:      string;
  imageBase64?: string;
  mediaType?:   string;
  isError?:     boolean;
}

export default function ChatPanel({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking…");

  // TTS state
  const [voices, setVoices]               = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [isPaused, setIsPaused]           = useState(false);

  const classifyQuestion = (text: string, hasImage: boolean): string => {
    if (hasImage) return "Analyzing your photo…";
    const lower = text.toLowerCase();
    if (/\bwhere\b|which side|location|find the|(left|right) of|which button|diopter/.test(lower))
      return "Looking at the diagram…";
    if (/d60|nikon|\bmenu\b|\bmode\b|\biso\b|shutter|aperture|\bflash\b|\blens\b|autofocus|white balance|metering|playback|\bfocus\b|exposure|burst|continuous|viewfinder|\bdial\b|selector|release|image quality|settings/.test(lower))
      return "Checking the D60 manual…";
    return "Drawing on photography knowledge…";
  };

  const [pendingImage, setPendingImage]     = useState<{
    base64: string; mediaType: string; previewUrl: string;
  } | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const bottomRef          = useRef<HTMLDivElement>(null);
  const latestAssistantRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef       = useRef<HTMLInputElement>(null);
  const cameraInputRef     = useRef<HTMLInputElement>(null);
  const scrollTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollStepRef      = useRef<number>(0);
  const panelRef           = useRef<HTMLDivElement>(null);
  const fabRef             = useRef<HTMLButtonElement>(null);

  // Load available TTS voices and restore saved preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const ALLOWED = ["Google US English", "Google UK English Female", "Google UK English Male"];

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      const filtered = available.filter(v => ALLOWED.includes(v.name));
      const list = filtered.length > 0 ? filtered : available.filter(v => v.lang.startsWith("en"));
      setVoices(list);
      const saved = localStorage.getItem("tts-voice");
      if (saved && list.find(v => v.name === saved)) {
        setSelectedVoice(saved);
      } else {
        setSelectedVoice(list[0]?.name ?? "");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Stop speaking when the panel closes
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      clearScrollTimer();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close panel when clicking outside it (replaces full-screen backdrop)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        fabRef.current   && !fabRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onOpenChange]);

  // Scroll: user message → bottom; assistant message → top of that message
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === "assistant") {
      latestAssistantRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    localStorage.setItem("tts-voice", voiceName);
  };

  const lastAssistantMsg   = [...messages].reverse().find(m => m.role === "assistant" && !m.isError);
  const lastAssistantIndex = messages.reduce((acc, m, i) => m.role === "assistant" ? i : acc, -1);

  const clearScrollTimer = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    clearScrollTimer();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pauseSpeaking = () => {
    window.speechSynthesis?.pause();
    clearScrollTimer();
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
    // Restart scroll from current position to bottom at the same rate
    const container = messagesContainerRef.current;
    if (container && scrollStepRef.current > 0) {
      scrollTimerRef.current = setInterval(() => {
        const endTop = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= endTop) { clearScrollTimer(); return; }
        container.scrollTop = Math.min(container.scrollTop + scrollStepRef.current, endTop);
      }, 50);
    }
  };

  const speakLatest = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) { stopSpeaking(); return; }
    if (!lastAssistantMsg) return;

    window.speechSynthesis.cancel();
    clearScrollTimer();

    const content = lastAssistantMsg.content;
    const utterance = new SpeechSynthesisUtterance(content);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;

    // Estimate speech duration: ~143 words/min at rate 0.95
    const wordCount = content.trim().split(/\s+/).length;
    const estimatedMs = (wordCount / 143) * 60 * 1000;

    const finish = () => {
      clearScrollTimer();
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onend   = finish;
    utterance.onerror = finish;

    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);

    // Smoothly scroll the messages container from its current position to the
    // bottom over the estimated speech duration
    const container = messagesContainerRef.current;
    if (container) {
      const startTop   = container.scrollTop;
      const endTop     = container.scrollHeight - container.clientHeight;
      const distance   = Math.max(0, endTop - startTop);
      const intervalMs = 50; // 20 fps
      const steps      = Math.max(1, estimatedMs / intervalMs);
      const perStep    = distance / steps;
      scrollStepRef.current = perStep; // save so resume can reuse it
      let step = 0;

      scrollTimerRef.current = setInterval(() => {
        step++;
        if (step >= steps || !container) { clearScrollTimer(); return; }
        container.scrollTop = startTop + perStep * step;
      }, intervalMs);
    }
  };

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
    stopSpeaking();
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
    setLoadingMessage(classifyQuestion(text, !!newMsg.imageBase64));
    setIsLoading(true);

    const nonError = updated.filter(m => !m.isError);
    const recentMessages = nonError
      .filter((m, i) => i === nonError.length - 1 || m.role !== nonError[i + 1].role)
      .slice(-10);

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
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFileSelect} />

      {/* Floating button */}
      <button
        ref={fabRef}
        onClick={() => onOpenChange(!isOpen)}
        title="Photo Assistant"
        className="chat-fab"
        style={{
          position: "fixed", bottom: "24px", right: "max(24px, calc((100vw - 1200px) / 2 + 24px))", zIndex: 50,
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
          <svg width="38" height="38" viewBox="0 0 36 36" style={{ display: "block" }}>
            <text x="18" y="30" textAnchor="middle" fontSize="34" fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="#0e2420" stroke="white" strokeWidth="3.5" paintOrder="stroke">?</text>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div ref={panelRef} className="chat-panel-box" style={{
          position: "fixed", bottom: "88px", right: "max(24px, calc((100vw - 1200px) / 2 + 24px))", zIndex: 40,
          width: "min(360px, calc(100vw - 48px))",
          backgroundColor: "#142e2a",
          border: "1px solid #1a3530",
          borderRadius: "16px",
          display: "flex", flexDirection: "column",
          height: "520px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px", backgroundColor: "#112824",
            borderBottom: "1px solid #1a3530",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "32px", height: "32px", backgroundColor: "#6ee7b7",
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "20px", color: "#e8f8f2" }}>Photo Assistant</p>
              <p style={{ margin: 0, fontSize: "15px", color: "#5a9e8e" }}>Ask me anything about your D60</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => { stopSpeaking(); setMessages([]); }}
                title="Clear chat"
                style={{
                  background: "none", border: "none", color: "#3a7a6a",
                  fontSize: "14px", cursor: "pointer", padding: "4px 8px",
                  borderRadius: "6px", flexShrink: 0,
                }}
              >Clear</button>
            )}
          </div>

          {/* Voice picker + Read aloud bar */}
          {voices.length > 0 && (
            <div style={{
              padding: "7px 12px", backgroundColor: "#0f2421",
              borderBottom: "1px solid #1a3530",
              display: "flex", alignItems: "center", gap: "7px",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a9e8e" strokeWidth="2" style={{ flexShrink: 0 }}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              <select
                value={selectedVoice}
                onChange={e => handleVoiceChange(e.target.value)}
                style={{
                  flex: 1, minWidth: 0, backgroundColor: "#142e2a",
                  border: "1px solid #1a3530", borderRadius: "6px",
                  color: "#a8d4c4", fontSize: "12px", padding: "3px 6px",
                  outline: "none", cursor: "pointer",
                }}
              >
                {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
              <div style={{ width: "1px", height: "18px", backgroundColor: "#1a3530", flexShrink: 0 }} />

              {/* Play / Pause / Resume button */}
              <button
                onClick={() => {
                  if (isPaused)        resumeSpeaking();
                  else if (isSpeaking) pauseSpeaking();
                  else                 speakLatest();
                }}
                disabled={!lastAssistantMsg && !isPaused}
                title={isPaused ? "Resume" : isSpeaking ? "Pause" : "Read aloud"}
                style={{
                  background: "none", border: "none",
                  cursor: (lastAssistantMsg || isPaused) ? "pointer" : "not-allowed",
                  color: (isSpeaking || isPaused) ? "#6ee7b7" : lastAssistantMsg ? "#a8d4c4" : "#3a7a6a",
                  fontSize: "12px", display: "flex", alignItems: "center", gap: "4px",
                  flexShrink: 0, padding: "2px 4px", borderRadius: "4px", transition: "color 0.15s",
                }}
              >
                {isSpeaking && !isPaused ? (
                  /* Pause icon */
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="4" height="16" rx="1"/>
                    <rect x="15" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  /* Play icon */
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
                {isSpeaking && !isPaused ? "Pause" : isPaused ? "Resume" : "Read"}
              </button>

              {/* Stop button — only shown while active or paused */}
              {(isSpeaking || isPaused) && (
                <button
                  onClick={stopSpeaking}
                  title="Stop reading"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#5a9e8e", fontSize: "12px",
                    display: "flex", alignItems: "center", gap: "3px",
                    flexShrink: 0, padding: "2px 4px", borderRadius: "4px",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2"/>
                  </svg>
                  Stop
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <p style={{ color: "#3a7a6a", fontSize: "17px", lineHeight: 1.6, margin: 0 }}>
                  Hey! Ask me anything about your Nikon D60, your lenses, or photography in general. Tap the image icon to upload a photo for feedback.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                ref={i === lastAssistantIndex ? latestAssistantRef : undefined}
                style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div style={{
                  maxWidth: "85%", padding: "9px 13px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  backgroundColor: m.role === "user" ? "#6ee7b7" : "#1a3530",
                  color: m.role === "user" ? "#0e2420" : "#a8d4c4",
                  fontSize: "17px", lineHeight: 1.55, whiteSpace: "pre-wrap",
                }}>
                  {m.imageBase64 && (
                    <img src={`data:${m.mediaType};base64,${m.imageBase64}`} alt="Uploaded photo"
                      style={{ width: "100%", borderRadius: "8px", display: "block", marginBottom: m.content ? "6px" : 0 }} />
                  )}
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ backgroundColor: "#1a3530", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#5a9e8e", fontSize: "15px", fontStyle: "italic" }}>{loadingMessage}</span>
                  <span style={{ display: "flex", gap: "4px" }}>
                    {[0, 150, 300].map(d => (
                      <span key={d} style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        backgroundColor: "#5a9e8e", display: "inline-block",
                        animation: `bounce 1s ${d}ms infinite`,
                      }}/>
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Pending image preview */}
          {pendingImage && (
            <div style={{ padding: "8px 12px", backgroundColor: "#112824", borderTop: "1px solid #1a3530" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={pendingImage.previewUrl} alt="Ready to send"
                  style={{ height: "64px", width: "auto", borderRadius: "8px", display: "block" }} />
                <button onClick={() => setPendingImage(null)} style={{
                  position: "absolute", top: "-6px", right: "-6px",
                  width: "18px", height: "18px", backgroundColor: "#142e2a",
                  border: "1px solid #5a9e8e", borderRadius: "50%", color: "#a8d4c4",
                  fontSize: "12px", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", padding: 0,
                }}>×</button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: "12px", borderTop: "1px solid #1a3530",
            backgroundColor: "#112824", display: "flex", gap: "8px", alignItems: "center",
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {showUploadMenu && (
                <>
                  <div onClick={() => setShowUploadMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0,
                    backgroundColor: "#112824", border: "1px solid #1a3530",
                    borderRadius: "10px", overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)", minWidth: "170px", zIndex: 10,
                  }}>
                    <button onClick={() => { cameraInputRef.current?.click(); setShowUploadMenu(false); }}
                      style={{ width: "100%", padding: "11px 14px", background: "none", border: "none",
                        borderBottom: "1px solid #1a3530", color: "#a8d4c4", fontSize: "17px",
                        textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a9e8e" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Take photo
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                      style={{ width: "100%", padding: "11px 14px", background: "none", border: "none",
                        color: "#a8d4c4", fontSize: "17px", textAlign: "left", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "10px" }}>
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
              <button onClick={() => setShowUploadMenu(o => !o)} title="Upload a photo" style={{
                width: "36px", height: "36px",
                backgroundColor: pendingImage ? "#6ee7b7" : "transparent",
                border: `1px solid ${pendingImage ? "#6ee7b7" : "#1a3530"}`,
                borderRadius: "10px", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", transition: "background 0.15s, border 0.15s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={pendingImage ? "#0e2420" : "#5a9e8e"} strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
            </div>

            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={pendingImage ? "Add a question, or just hit send…" : "Ask a question…"}
              style={{
                flex: 1, minWidth: 0, padding: "9px 12px", boxSizing: "border-box",
                backgroundColor: "#142e2a", border: "1px solid #1a3530",
                borderRadius: "10px", color: "#a8d4c4", fontSize: "17px", outline: "none",
              }} />

            <button onClick={sendMessage} disabled={!canSend} style={{
              width: "36px", height: "36px", backgroundColor: "#6ee7b7",
              border: "none", borderRadius: "10px", display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: canSend ? "pointer" : "not-allowed", opacity: canSend ? 1 : 0.4, flexShrink: 0,
            }}>
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
