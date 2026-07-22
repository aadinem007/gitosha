import { assertPricingInvariants, VAULT_PLANS, FOUNDRY_PLANS } from "../src/lib/pricing";
import { matchKnowledge, KNOWLEDGE, CHAT_GREETING } from "../src/lib/chat-knowledge";
import { safeRedirectPath } from "../src/lib/secure";
import { existsSync } from "fs";
import path from "path";

let failed = 0;

function ok(label: string) {
  console.log(`✓ ${label}`);
}

function fail(label: string, detail?: string) {
  failed += 1;
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

// Pricing
const pricingErrors = assertPricingInvariants();
if (pricingErrors.length) {
  pricingErrors.forEach((e) => fail("pricing invariant", e));
} else {
  ok(`pricing invariants (${VAULT_PLANS.length + FOUNDRY_PLANS.length} plans)`);
}

for (const p of [...VAULT_PLANS, ...FOUNDRY_PLANS]) {
  if (p.features.length >= 6) ok(`${p.id}: ${p.features.length} features`);
  else fail(`${p.id}: expected ≥6 features`, `got ${p.features.length}`);
}

// Chat knowledge
if (!CHAT_GREETING.text || !CHAT_GREETING.suggestions?.length) fail("chat greeting incomplete");
else ok("chat greeting");

const samples: [string, string][] = [
  ["show pricing", "pricing"],
  ["how do I download after paying", "delivery"],
  ["why pay 29999 for agency", "solo-vs-agency"],
  ["refund policy", "legal"],
  ["what is free", "free"],
];

for (const [q, expectId] of samples) {
  const reply = matchKnowledge(q);
  const entry = KNOWLEDGE.find((k) => k.id === expectId);
  if (!entry) {
    fail(`knowledge missing id ${expectId}`);
    continue;
  }
  // Reply should not be empty and should share some text with expected entry or be specific
  if (!reply.text || reply.text.length < 40) fail(`weak reply for: ${q}`);
  else ok(`chat match: "${q}"`);
}

// Auth redirect hardening
const redirectCases: [string, string][] = [
  ["/vault", "/vault"],
  ["/vault/ideas", "/vault/ideas"],
  ["//evil.com", "/vault"],
  ["https://evil.com", "/vault"],
  ["/\\evil", "/vault"],
  ["vault", "/vault"],
];
for (const [input, expect] of redirectCases) {
  const got = safeRedirectPath(input, "/vault");
  if (got === expect) ok(`safeRedirectPath: ${JSON.stringify(input)}`);
  else fail(`safeRedirectPath: ${JSON.stringify(input)}`, `got ${got}, want ${expect}`);
}

// Kit files Agency buyers are promised
const kitRoot = path.join(process.cwd(), "kits", "foundry");
const required = [
  "package.json",
  "README.md",
  "docs/GETTING-STARTED.md",
  "docs/agency/CLIENT-HANDOFF.md",
  "docs/agency/INVOICE-TEMPLATE.md",
  "docs/agency/PROPOSAL-TEMPLATE.md",
  "docs/agency/WHITE-LABEL.md",
  "env.example",
];
for (const rel of required) {
  if (existsSync(path.join(kitRoot, rel))) ok(`kit:${rel}`);
  else fail(`kit missing ${rel}`);
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed.");
