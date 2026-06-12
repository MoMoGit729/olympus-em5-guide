"use client";

import { useState } from "react";
import CameraInteractive from "@/components/CameraInteractive";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0ece4", paddingBottom: "100px" }}>

      {/* Header */}
      <header className="site-header" style={{
        backgroundColor: "#e6e1d8",
        borderBottom:    "2px solid #c8c2b6",
        paddingTop:      "max(env(safe-area-inset-top), 22px)",
        paddingBottom:   "14px",
      }}>
        <div className="site-header-inner" style={{
          maxWidth:    "1200px",
          margin:      "0 auto",
          padding:     "0 16px",
          display:     "flex",
          alignItems:  "flex-start",
          gap:         "12px",
        }}>
          <div className="site-header-icon" style={{
            width:           "54px",
            height:          "54px",
            backgroundColor: "#2d6464",
            borderRadius:    "10px",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f0ece4" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="site-header-title" style={{ color: "#1a3030", fontSize: "24px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Olympus E-M5 Mark III Guide
            </h1>
            <p className="site-header-sub" style={{ color: "#5a7a6e", fontSize: "15px", margin: 0, marginTop: "5px" }}>Interactive Camera Reference</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 16px" }}>
        <CameraInteractive chatOpen={chatOpen} onChatClose={() => setChatOpen(false)}>
          <ChatPanel isOpen={chatOpen} onOpenChange={setChatOpen} />
        </CameraInteractive>
      </main>
    </div>
  );
}
