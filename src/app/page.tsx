import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { TrackField } from "@/components/TrackField";
import { WaitlistForm } from "@/components/WaitlistForm";
import { BRAND } from "@/lib/brand";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";

const OPERATOR = VAULT_PLANS.find((p) => p.id === "vault-pro")!;
const SOLO = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;

const PROOF_COMPARE = [
  {
    label: "Decide what to ship",
    scout: "Public scores + method",
    operator: "Full teardowns + kill criteria",
  },
  {
    label: "Ship the product",
    scout: "—",
    operator: "15% off Foundry forever",
  },
  {
    label: "Export & share",
    scout: "Browse scoreboard",
    operator: "CSV export + private Vault",
  },
  {
    label: "Support",
    scout: "Gita on-site",
    operator: "Gita + email for access & billing",
  },
];

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
              Scored opportunities with kill criteria — plus a production scaffold that already takes
              payments. Built for operators who ship.
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
            <h2 className="chapter-title">Kill bad ideas early.</h2>
            <p className="chapter-copy">
              Ten dimensions. Honest scores. Kill criteria that tell you what not to build — so your
              next quarter isn’t spent on vanity lists.
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
            <h2 className="chapter-title">Ship on day one.</h2>
            <p className="chapter-copy">
              Auth, database, checkout, webhooks, deploy docs — one zip. Pay once. Download the same
              minute. Solo for your product. Agency for every client after.
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

        <section className="proof-plane" id="proof">
          <div className="proof-inner">
            <p className="proof-kicker">What you get</p>
            <h2 className="proof-title">Operator and Foundry, unpacked.</h2>
            <p className="proof-lede">
              Dense enough to justify the price. Clear enough to decide in one scroll.
            </p>

            <div className="proof-grid">
              <div className="proof-col">
                <div className="proof-col-head">
                  <p className="proof-col-name">Operator · ₹999/mo</p>
                  <p className="proof-col-sub">First 100 seats at launch price</p>
                </div>
                <ul className="proof-list">
                  {OPERATOR.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/pricing" className="proof-link">
                  Unlock Operator →
                </Link>
              </div>

              <div className="proof-col proof-col-hot">
                <div className="proof-col-head">
                  <p className="proof-col-name">Foundry Solo · ₹9,999</p>
                  <p className="proof-col-sub">One-time · instant zip</p>
                </div>
                <ul className="proof-list">
                  {SOLO.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href="/foundry-kit" className="proof-link">
                  Open Foundry →
                </Link>
              </div>
            </div>

            <div className="proof-compare">
              <h3 className="proof-compare-title">Scout vs Operator</h3>
              <div className="proof-table-wrap">
                <table className="proof-table">
                  <thead>
                    <tr>
                      <th>Outcome</th>
                      <th>Scout</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROOF_COMPARE.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.scout}</td>
                        <td>{row.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
