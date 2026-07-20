import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">You&apos;re in.</h1>
          <p className="mt-3 text-neutral-400">
            Check your email for your receipt and next steps — for Foundry Kit that&apos;s your
            license key, for Vault that&apos;s your login link.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
