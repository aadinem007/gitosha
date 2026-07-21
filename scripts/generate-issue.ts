/**
 * Weekly research-pipeline automation.
 *
 * Usage:
 *   npm run generate-issue -- --input scripts/issues/2026-07-27.json
 *
 * Input JSON shape: { title: string, ideas: { name, category, oneLiner, scores }[] }
 *
 * What it does, end to end, with no manual step in between:
 *   1. Reads a batch of candidate ideas (name/category/one-liner/scores).
 *   2. Calls an LLM to draft a full teardown for each (market, competitors, gaps).
 *   3. Upserts everything into the database via Prisma.
 *   4. Creates an Issue record and emails the digest to every subscriber.
 *
 * This is the piece that turns "research the market" from a manual weekly
 * chore into a single command. Swap the fetchSourceSignal() stub for a real
 * web-search/SERP API call to fully automate step 0 (finding candidates) too.
 */
import { readFileSync } from "fs";
import { prisma } from "../src/lib/prisma";
import { totalScore, type IdeaScores } from "../src/lib/ideas-data";
import { Resend } from "resend";

type InputIdea = {
  name: string;
  category: string;
  oneLiner: string;
  scores: IdeaScores;
};

type InputFile = { title: string; ideas: InputIdea[] };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function draftTeardown(idea: InputIdea): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `${idea.oneLiner} (Set OPENAI_API_KEY to auto-generate a full teardown for this idea.)`;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write terse, evidence-grounded business teardowns for an indie-hacker research newsletter. No hype, no fabricated statistics — flag estimates as estimates. 120 words max.",
        },
        {
          role: "user",
          content: `Idea: ${idea.name} (${idea.category})\nOne-liner: ${idea.oneLiner}\nScores (0-10 each, 10=favorable): ${JSON.stringify(
            idea.scores
          )}\n\nWrite the teardown.`,
        },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    console.warn(`LLM call failed for ${idea.name}: ${res.status}`);
    return idea.oneLiner;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? idea.oneLiner;
}

async function emailDigest(title: string, ideas: InputIdea[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping digest send.");
    return;
  }
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "Gitosha <hello@gitosha.com>";

  const subscribers = await prisma.subscriber.findMany({ where: { status: "ACTIVE" } });
  const top3 = [...ideas].sort((a, b) => totalScore(b.scores) - totalScore(a.scores)).slice(0, 3);

  const body = [
    `${title}\n`,
    ...top3.map((i) => `${i.name} — ${totalScore(i.scores)}/100\n${i.oneLiner}\n`),
    "\nFull teardowns and the rest of this week's ideas are in the Vault: " +
      (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gitosha.vercel.app") +
      "/vault",
  ].join("\n");

  for (const sub of subscribers) {
    await resend.emails.send({ from, to: sub.email, subject: title, text: body });
  }
  console.log(`Digest sent to ${subscribers.length} subscribers.`);
}

async function main() {
  const inputArgIndex = process.argv.indexOf("--input");
  const inputPath = inputArgIndex !== -1 ? process.argv[inputArgIndex + 1] : undefined;
  if (!inputPath) {
    console.error("Usage: npm run generate-issue -- --input <path-to-json>");
    process.exit(1);
  }

  const parsed: InputFile = JSON.parse(readFileSync(inputPath, "utf-8"));
  const ideaIds: string[] = [];

  for (const idea of parsed.ideas) {
    const teardownMd = await draftTeardown(idea);
    const record = await prisma.idea.upsert({
      where: { slug: slugify(idea.name) },
      create: {
        slug: slugify(idea.name),
        name: idea.name,
        category: idea.category,
        oneLiner: idea.oneLiner,
        scores: idea.scores,
        totalScore: totalScore(idea.scores),
        isPremium: true,
        teardownMd,
        publishedAt: new Date(),
      },
      update: {
        category: idea.category,
        oneLiner: idea.oneLiner,
        scores: idea.scores,
        totalScore: totalScore(idea.scores),
        teardownMd,
        publishedAt: new Date(),
      },
    });
    ideaIds.push(record.id);
    console.log(`Upserted ${idea.name} (${totalScore(idea.scores)}/100)`);
  }

  await prisma.issue.create({
    data: {
      slug: slugify(parsed.title),
      title: parsed.title,
      summaryMd: `${parsed.ideas.length} ideas scored this issue.`,
      ideaIds,
      publishedAt: new Date(),
    },
  });

  await emailDigest(parsed.title, parsed.ideas);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
