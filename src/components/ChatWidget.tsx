"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChatLink, ChatReply } from "@/lib/chat-knowledge";
import { CHAT_GREETING } from "@/lib/chat-knowledge";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatWidget() {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const isHome = pathname === "/";
  const [homePastHero, setHomePastHero] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "greet",
      role: "assistant",
      text: CHAT_GREETING.text,
      suggestions: CHAT_GREETING.suggestions,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep ASK out of the home first viewport — reveal after the hero.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      setHomePastHero(window.scrollY > Math.min(window.innerHeight * 0.72, 640));
    };
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, messages, typing]);

  function pushAssistant(reply: ChatReply) {
    setMessages((m) => [
      ...m,
      {
        id: uid(),
        role: "assistant",
        text: reply.text,
        links: reply.links,
        suggestions: reply.suggestions,
      },
    ]);
  }

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || typing) return;

    setInput("");
    setMessages((m) => [...m, { id: uid(), role: "user", text: message }]);
    setTyping(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.text,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushAssistant({
          text: data.error ?? "Something glitched. Try again in a moment.",
          suggestions: ["Show pricing", "How do I get Foundry after paying?"],
        });
      } else {
        pushAssistant(data.reply as ChatReply);
      }
    } catch {
      pushAssistant({
        text: "Network hiccup. Check your connection and try again.",
        suggestions: ["Show pricing", "Contact support"],
      });
    } finally {
      setTyping(false);
    }
  }

  if (isHome && !homePastHero && !open) return null;

  return (
    <div className="chat-root pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label="Gita chat"
          className="chat-panel pointer-events-auto flex w-[min(100vw-1.5rem,380px)] flex-col overflow-hidden border border-[var(--line)]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--hull)] px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-base tracking-wide text-[var(--ink)]">Gita</p>
              <p className="truncate text-xs text-[var(--muted)]">Gitosha guide · usually instant</p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            >
              ✕
            </button>
          </header>

          <div className="flex max-h-[min(58vh,440px)] flex-1 flex-col gap-3 overflow-y-auto bg-[var(--hull)]/95 px-3 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-[var(--brass)] text-[var(--hull)]"
                      : "rounded-bl-md border border-[var(--line)] bg-[var(--panel)] text-[var(--fog)]"
                  }`}
                >
                  {m.text}
                </div>
                {m.links && m.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.links.map((l) =>
                      l.href.startsWith("mailto:") ? (
                        <a
                          key={l.href + l.label}
                          href={l.href}
                          className="rounded-full border border-[var(--brass)]/40 bg-[var(--brass)]/10 px-3 py-1 text-xs font-semibold text-[var(--brass)] hover:bg-[var(--brass)]/20"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          key={l.href + l.label}
                          href={l.href}
                          className="rounded-full border border-[var(--brass)]/40 bg-[var(--brass)]/10 px-3 py-1 text-xs font-semibold text-[var(--brass)] hover:bg-[var(--brass)]/20"
                        >
                          {l.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
                {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex max-w-full flex-wrap gap-1.5">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-[var(--line)] bg-transparent px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--brass)]/50 hover:text-[var(--ink)]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5">
                <span className="chat-dot" />
                <span className="chat-dot chat-dot-2" />
                <span className="chat-dot chat-dot-3" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="border-t border-[var(--line)] bg-[var(--panel)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask about pricing, Foundry, Vault…"
                className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--hull)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brass)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="btn-primary shrink-0 rounded-xl px-3.5 py-2.5 text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="chat-launcher pointer-events-auto group relative flex h-12 w-12 items-center justify-center bg-[var(--brass)] text-[var(--hull)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hull)]"
      >
        {open ? (
          <span className="font-display text-lg leading-none">✕</span>
        ) : (
          <span className="font-display text-[11px] font-bold tracking-wide">ASK</span>
        )}
      </button>
    </div>
  );
}
