import CameraInteractive from "@/components/CameraInteractive";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#091412", paddingBottom: "100px" }}>

      {/* Header */}
      <header style={{
        backgroundColor: "#0f1e1c",
        borderBottom:    "1px solid #1a3530",
        padding:         "0 24px",
        display:         "flex",
        alignItems:      "center",
        height:          "60px",
        gap:             "12px",
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#091412" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M9 2h6l1.5 3H20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5L9 2z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ color: "#e8f8f2", fontSize: "16px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Nikon D60 Guide
          </h1>
          <p style={{ color: "#5a9e8e", fontSize: "11px", margin: 0 }}>Interactive Camera Reference</p>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 16px" }}>
        <CameraInteractive />
      </main>
    </div>
  );
}
