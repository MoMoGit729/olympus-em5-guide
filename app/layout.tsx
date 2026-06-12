import type { Metadata, Viewport } from "next";
import "./globals.css";
import PasswordGate from "@/components/PasswordGate";

export const viewport: Viewport = {
  themeColor: "#2d6464",
};

export const metadata: Metadata = {
  title: "Olympus E-M5 Mark III Guide",
  description: "Interactive camera reference and photography assistant for the Olympus E-M5 Mark III",
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
