import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Shipyard — Know what to build. Ship it properly.",
  description:
    "Honest opportunity research scored on a public 10-dimension rubric, plus the production scaffold to launch winners. Built for Indian operators. Pay with UPI.",
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
