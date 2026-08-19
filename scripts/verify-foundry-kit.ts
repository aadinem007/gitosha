import { existsSync } from "fs";
import path from "path";

const root = path.join(process.cwd(), "kits", "foundry");
const required = [
  "package.json",
  "README.md",
  "LICENSE.md",
  ".env.example",
  "prisma/schema.prisma",
  "src/app/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/login/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/api/checkout/route.ts",
  "src/app/api/checkout/verify/route.ts",
  "src/app/api/razorpay/webhook/route.ts",
  "src/lib/pricing.ts",
  "src/lib/razorpay.ts",
  "src/lib/rate-limit.ts",
  "src/proxy.ts",
  "docs/GETTING-STARTED.md",
];

let ok = true;
for (const rel of required) {
  const full = path.join(root, rel);
  if (!existsSync(full)) {
    console.error("MISSING", rel);
    ok = false;
  } else {
    console.log("ok", rel);
  }
}

if (!ok) {
  process.exit(1);
}
console.log("\nFoundry kit package is complete.");
