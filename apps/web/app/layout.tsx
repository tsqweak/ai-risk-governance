import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "./components/ui";

export const metadata: Metadata = {
  title: "AI Risk Governance",
  description: "AI risk governance demo for financial institutions"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
