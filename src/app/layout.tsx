import type { Metadata } from "next";
import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Shipyard — Opportunity research & production scaffolds for builders",
  description:
    "Shipyard scores real software businesses on a public 10-dimension rubric, then sells the production scaffold you need to ship the winners. Honest research. Working payments. No hype listicles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipyard-omega-opal.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="shipyard-bg flex min-h-full flex-col text-[var(--ink)]">{children}</body>
    </html>
  );
}
