import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";

export const metadata: Metadata = {
  title: `AI Disclosure — ${BRAND.name}`,
  description: `How ${BRAND.name} uses AI in the product guide chat.`,
};

export default async function AiDisclosurePage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="AI disclosure" config={config}>
      <p>{config.ai.disclosure}</p>

      <h2>What {config.ai.chatWidgetName} is</h2>
      <ul>
        <li>A product guide chat widget embedded on the marketing site</li>
        <li>Grounded answers from on-site knowledge (pricing, method, FAQ)</li>
        <li>Not a social network, not medical/legal/financial advice</li>
      </ul>

      <h2>Optional LLM</h2>
      <p>
        LLM active in this environment:{" "}
        <strong>{config.ai.usesOptionalLlm ? `yes (${config.ai.llmProvider})` : "no"}</strong>
      </p>
      <ul>
        {config.ai.dataSent.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <h2>Consent</h2>
      <p>
        When the AI processing category is enabled in cookie config, you can manage it in{" "}
        <Link href="/legal/preferences">Preferences</Link>. Necessary site functions do not require
        AI consent.
      </p>
    </LegalShell>
  );
}
