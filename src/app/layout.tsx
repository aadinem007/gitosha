import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import { ChatWidget } from "@/components/ChatWidget";
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
  title: "Shipyard — Stop building the wrong product",
  description:
    "Honest opportunity scores, kill criteria, and a production SaaS scaffold with Razorpay. Operator from ₹999/mo launch. Foundry Agency for studios at ₹29,999 one-time.",
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
      <body className="shipyard-bg flex min-h-full flex-col text-[var(--ink)]">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
