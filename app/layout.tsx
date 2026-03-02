import type { Metadata } from "next";
import "./globals.css";
import ChatPanel from "@/components/ChatPanel";

export const metadata: Metadata = {
  title: "Nikon D60 Photography Guide",
  description: "Interactive camera reference and photography assistant for the Nikon D60",
  themeColor: "#0e2420",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatPanel />
      </body>
    </html>
  );
}
