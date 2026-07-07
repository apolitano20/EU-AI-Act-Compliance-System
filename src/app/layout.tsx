import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { MainNav } from "@/components/shared/main-nav";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EU AI Act Compliance — AI System Inventory",
  description: "Structured inventory of AI systems for EU AI Act readiness assessment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        <MainNav />
        <main className="max-w-screen-xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
