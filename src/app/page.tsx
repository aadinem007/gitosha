import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TrackField } from "@/components/TrackField";
import { WaitlistForm } from "@/components/WaitlistForm";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="hero-cinematic">
          <TrackField />
          <div className="hero-stage">
            <h1 className="brand-mark animate-draft">{BRAND.nameUpper}</h1>
            <p className="hero-line animate-rise">{BRAND.tagline}</p>
            <p className="hero-support animate-rise">
              Opportunity scores, kill criteria, and a Razorpay-ready scaffold — for Indian operators
              first.
            </p>
            <div className="hero-cta animate-rise-delay">
              <Link href="/pricing" className="btn-primary">
                Pricing
              </Link>
              <Link href="/foundry-kit" className="btn-ghost">
                Foundry
              </Link>
            </div>
          </div>
        </section>

        <section className="chapter chapter-vault" id="vault">
          <div className="chapter-atmosphere" aria-hidden="true" />
          <div className="chapter-inner">
            <p className="chapter-index">01</p>
            <p className="chapter-eyebrow">{BRAND.products.vault}</p>
            <h2 className="chapter-title">Know what to build.</h2>
            <p className="chapter-copy">
              Honest opportunity scores and kill criteria — so you stop drowning in vanity idea
              lists and start filtering for revenue.
            </p>
            <Link href="/pricing" className="chapter-link">
              See {BRAND.products.vault} plans →
            </Link>
          </div>
        </section>

        <section className="chapter chapter-foundry" id="foundry">
          <div className="chapter-atmosphere chapter-atmosphere-alt" aria-hidden="true" />
          <div className="chapter-inner chapter-inner-end">
            <p className="chapter-index">02</p>
            <p className="chapter-eyebrow">{BRAND.products.foundry}</p>
            <h2 className="chapter-title">Then ship it.</h2>
            <p className="chapter-copy">
              Production SaaS scaffold with Razorpay. Pay once in INR — Solo or Agency — download
              the zip the same minute.
            </p>
            <Link href="/foundry-kit" className="chapter-link">
              Open {BRAND.products.foundry} →
            </Link>
          </div>
        </section>

        <section className="closing">
          <div className="closing-inner">
            <h2 className="closing-title">
              Every week you wait is another week building the wrong thing.
            </h2>
            <div className="closing-cta">
              <Link href="/pricing" className="btn-primary">
                Pricing
              </Link>
              <Link href="/faq" className="btn-ghost">
                FAQ
              </Link>
            </div>
            <div className="closing-waitlist">
              <p className="closing-waitlist-label">Free Scout brief — weekly</p>
              <WaitlistForm cta="Join the list" layout="row" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
