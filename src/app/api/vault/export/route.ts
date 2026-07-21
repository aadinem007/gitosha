import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limited = rateLimit({
    key: `vault-export:${clientIp(req)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many exports" }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { email: data.user.email.toLowerCase() },
  });
  const isPro = subscriber?.tier === "PRO" || subscriber?.tier === "TEAM";
  if (!isPro || subscriber?.status !== "ACTIVE") {
    return NextResponse.json({ error: "Operator access required" }, { status: 403 });
  }

  const ideas = await prisma.idea.findMany({ orderBy: { totalScore: "desc" } });
  const header = [
    "slug",
    "name",
    "category",
    "one_liner",
    "total_score",
    "is_premium",
    "scores_json",
  ];
  const rows = ideas.map((idea) =>
    [
      idea.slug,
      csvEscape(idea.name),
      csvEscape(idea.category),
      csvEscape(idea.oneLiner),
      String(idea.totalScore),
      String(idea.isPremium),
      csvEscape(JSON.stringify(idea.scores)),
    ].join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shipyard-vault-scoreboard.csv"',
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
