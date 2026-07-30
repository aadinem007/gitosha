import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { BRAND } from "@/lib/brand";
import { getLegalConfig } from "@/lib/legal/resolve";
import { ContactMailto } from "@/lib/legal/sections";

export const metadata: Metadata = {
  title: `DMCA — ${BRAND.name}`,
  description: `Copyright notice channel for ${BRAND.name}.`,
};

export default async function DmcaPage() {
  const config = await getLegalConfig();

  return (
    <LegalShell title="DMCA / copyright notices" config={config}>
      <p>{config.dmca.notice}</p>
      {config.dmca.agentEmail && (
        <p>
          Agent email: <ContactMailto email={config.dmca.agentEmail} />
        </p>
      )}
      <h2>Suggested notice contents</h2>
      <ul>
        <li>Identification of the copyrighted work</li>
        <li>URL or description of the allegedly infringing material on this site</li>
        <li>Your contact information</li>
        <li>A statement of good faith belief and accuracy under penalty of perjury where required</li>
      </ul>
      <p>
        Counter-notices and fair use questions should be handled by qualified counsel — we do not
        claim automated DMCA compliance.
      </p>
    </LegalShell>
  );
}
