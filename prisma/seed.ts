import { PrismaClient } from "@prisma/client";
import { SEED_IDEAS, totalScore } from "../src/lib/ideas-data";

const prisma = new PrismaClient();

async function main() {
  for (const idea of SEED_IDEAS) {
    await prisma.idea.upsert({
      where: { slug: idea.slug },
      create: {
        slug: idea.slug,
        name: idea.name,
        category: idea.category,
        oneLiner: idea.oneLiner,
        scores: idea.scores,
        totalScore: totalScore(idea.scores),
        isPremium: idea.isPremium,
        teardownMd: idea.teardownMd,
        publishedAt: new Date(),
      },
      update: {
        name: idea.name,
        category: idea.category,
        oneLiner: idea.oneLiner,
        scores: idea.scores,
        totalScore: totalScore(idea.scores),
        isPremium: idea.isPremium,
        teardownMd: idea.teardownMd,
      },
    });
  }
  console.log(`Seeded ${SEED_IDEAS.length} ideas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
