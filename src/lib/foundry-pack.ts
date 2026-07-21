import { createReadStream, existsSync, readdirSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { ZipArchive } from "archiver";
import type { LicenseTier } from "@prisma/client";

const KIT_ROOT = path.join(process.cwd(), "kits", "foundry");

const SKIP = new Set(["node_modules", ".next", ".git", ".DS_Store"]);

function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

function tierLicense(tier: LicenseTier, email: string, key: string): string {
  const rights =
    tier === "AGENCY"
      ? [
          "- Unlimited client projects",
          "- White-label rights (remove Shipyard / Foundry marks)",
          "- Do not resell this kit as a competing starter product",
        ].join("\n")
      : [
          "- One commercial product you own or operate",
          "- Do not share the zip or license key publicly",
          "- Agency rights require upgrading to Foundry Agency",
        ].join("\n");

  return `# Foundry Kit License — ${tier}

Issued to: ${email}
License key: ${key}
Issued by: Shipyard

## Rights
${rights}

## What you received
A production Next.js SaaS scaffold with auth, Postgres/Prisma, Razorpay checkout + webhooks, and deploy-ready defaults.

## Support
Contact the email on https://shipyard-omega-opal.vercel.app (Contact in footer).

No warranty. Provided as-is.
`;
}

function deliveryReadme(tier: LicenseTier, email: string, key: string): string {
  return `# Your Foundry delivery

Thanks for purchasing Foundry (${tier}).

- Buyer email: ${email}
- License key: ${key}
- Re-download anytime: open /license on the Shipyard site and enter this email + key

## Start in 5 minutes

\`\`\`bash
cp env.example (or .env.example) .env
npm install
npx prisma db push
npm run dev
\`\`\`

Full guide: docs/GETTING-STARTED.md
`;
}

/**
 * Streams a zip of kits/foundry with buyer-specific LICENSE + DELIVERY files.
 */
export function createFoundryZipStream(opts: {
  tier: LicenseTier;
  email: string;
  key: string;
}): { stream: Readable; filename: string } {
  if (!existsSync(KIT_ROOT)) {
    throw new Error("Foundry kit package is missing on the server");
  }

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const filename =
    opts.tier === "AGENCY" ? "foundry-agency.zip" : "foundry-solo.zip";

  for (const rel of walk(KIT_ROOT)) {
    if (rel === "LICENSE.md") continue;
    archive.append(createReadStream(path.join(KIT_ROOT, rel)), {
      name: `foundry-kit/${rel}`,
    });
  }

  archive.append(tierLicense(opts.tier, opts.email, opts.key), {
    name: "foundry-kit/LICENSE.md",
  });
  archive.append(deliveryReadme(opts.tier, opts.email, opts.key), {
    name: "foundry-kit/DELIVERY.md",
  });
  archive.append(`${opts.key}\n`, { name: "foundry-kit/.shipyard-license" });

  void archive.finalize();

  return { stream: archive as unknown as Readable, filename };
}

export function foundryKitExists(): boolean {
  return existsSync(path.join(KIT_ROOT, "package.json"));
}
