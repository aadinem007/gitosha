export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Legal</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        This is the Foundry kit starter. Replace this page with your product’s terms before you take
        live payments. Checkout requires the buyer to accept this document.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        Until you publish your own terms: you grant a license to use the software you sell under the
        plan purchased; you do not store card data on this scaffold; refunds follow the policy you
        publish.
      </p>
    </main>
  );
}
