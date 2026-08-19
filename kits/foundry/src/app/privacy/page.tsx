export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Legal</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        This is the Foundry kit starter. Replace this page with your product’s privacy policy before
        collecting customer data in production.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        Typical data on this scaffold: account email (magic-link auth), checkout email, and
        operational logs. Payment cards are handled by your configured payment provider — not stored
        in this app.
      </p>
    </main>
  );
}
