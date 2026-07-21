import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJsonLimited, stripControlChars } from "@/lib/secure";
import { matchKnowledge, type ChatReply } from "@/lib/chat-knowledge";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1000),
      })
    )
    .max(12)
    .optional(),
});

async function maybeLlmReply(message: string, grounded: ChatReply): Promise<ChatReply | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content: `You are Yardhand, the concise sales guide for Shipyard (India). Only use this grounded answer; do not invent prices or features. Keep under 90 words. Friendly, direct, no hype.

Grounded answer:
${grounded.text}

Allowed links (mention only if relevant): ${(grounded.links ?? []).map((l) => l.href).join(", ") || "none"}`,
          },
          { role: "user", content: message },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    return {
      text,
      links: grounded.links,
      suggestions: grounded.suggestions,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit({
    key: `chat:${clientIp(req)}`,
    limit: 24,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Slow down a second — too many messages." },
      { status: 429 }
    );
  }

  const body = await readJsonLimited(req, 16_384);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Send a short message." }, { status: 400 });
  }

  const message = stripControlChars(parsed.data.message).slice(0, 500);
  if (!message) {
    return NextResponse.json({ error: "Send a short message." }, { status: 400 });
  }

  const grounded = matchKnowledge(message);
  const enhanced = await maybeLlmReply(message, grounded);
  const reply = enhanced ?? grounded;

  return NextResponse.json({
    ok: true,
    reply,
    source: enhanced ? "assisted" : "knowledge",
  });
}
