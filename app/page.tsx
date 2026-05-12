"use client";

import { useState } from "react";
import CameraInteractive from "@/components/CameraInteractive";
import ChatPanel from "@/components/ChatPanel";
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <PasswordGate>
    <div style={{ minHeight: "100vh", backgroundColor: "#0e2420", paddingBottom: "100px" }}>

      {/* Header — full-width bar, inner content aligns with main content below */}
      <header className="site-header" style={{
        backgroundColor: "#142e2a",
        borderBottom:    "2px solid #1a3530",
        height:          "60px",
      }}>
        <div className="site-header-inner" style={{
          maxWidth:    "1200px",
          margin:      "0 auto",
          padding:     "0 16px",
          height:      "100%",
          display:     "flex",
          alignItems:  "center",
          gap:         "12px",
        }}>
          <div style={{
            width:           "32px",
            height:          "32px",
            backgroundColor: "#6ee7b7",
            borderRadius:    "6px",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e2420" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="site-header-title" style={{ color: "#e8f8f2", fontSize: "24px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Nikon D60 Guide
            </h1>
            <p className="site-header-sub" style={{ color: "#5a9e8e", fontSize: "15px", margin: 0 }}>Interactive Camera Reference</p>
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
    </PasswordGate>
  );
}
