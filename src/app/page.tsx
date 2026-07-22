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
              Honest opportunity scores, kill criteria, and a production SaaS scaffold — for
              builders and operators shipping real products.
            </p>
            <div className="hero-cta animate-rise-delay">
              <Link href="/pricing" className="btn-primary">
                Get pricing
              </Link>
              <Link href="/foundry-kit" className="btn-ghost">
                Open Foundry
              </Link>
              <Link href="/login" className="hero-signin">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="chapter chapter-vault" id="vault">
          <div className="chapter-visual" aria-hidden="true">
            <TrackField intensity="quiet" />
            <div className="chapter-visual-frame">
              <p className="chapter-visual-label">01 · Research plane</p>
              <div className="chapter-score-stack">
                <div className="chapter-score-bar" style={{ width: "86%" }} />
                <div className="chapter-score-bar is-mid" style={{ width: "62%" }} />
                <div className="chapter-score-bar is-low" style={{ width: "34%" }} />
              </div>
            </div>
          </div>
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
          <div className="chapter-inner">
            <p className="chapter-index">02</p>
            <p className="chapter-eyebrow">{BRAND.products.foundry}</p>
            <h2 className="chapter-title">Then ship it.</h2>
            <p className="chapter-copy">
              Production SaaS scaffold with auth, database, and checkout. Pay once — Solo or Agency —
              download the zip the same minute.
            </p>
            <Link href="/foundry-kit" className="chapter-link">
              Open {BRAND.products.foundry} →
            </Link>
          </div>
          <div className="chapter-visual chapter-visual-end" aria-hidden="true">
            <TrackField intensity="quiet" />
            <div className="chapter-visual-frame">
              <p className="chapter-visual-label">02 · Delivery plane</p>
              <ul className="chapter-kit-list">
                <li>Auth wired</li>
                <li>Checkout ready</li>
                <li>Deploy docs</li>
                <li>Instant zip</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closing-inner">
            <h2 className="closing-title">
              Every week you wait is another week building the wrong thing.
            </h2>
            <div className="closing-cta">
              <Link href="/pricing" className="btn-primary">
                Get pricing
              </Link>
              <Link href="/foundry-kit" className="btn-ghost">
                Buy Foundry
              </Link>
              <Link href="/refund" className="hero-signin">
                Refunds
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
