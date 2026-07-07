import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
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
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">EU AI Act</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-700">Compliance Readiness</span>
          <span className="text-slate-300">|</span>
          <Link href="/inventory" className="text-sm text-slate-500 hover:text-slate-900">Inventory</Link>
          <Link href="/entity-type" className="text-sm text-slate-500 hover:text-slate-900">Entity Type</Link>
          <Link href="/ai-system-definition" className="text-sm text-slate-500 hover:text-slate-900">AI System Definition</Link>
        </nav>
        <main className="max-w-screen-xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
