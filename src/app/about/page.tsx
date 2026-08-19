import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { WaitlistForm } from "@/components/WaitlistForm";
import { TrackField } from "@/components/TrackField";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About — Brand story | Gitosha",
  description:
    "The Gitosha brand story: why the name, why Vault and Foundry exist as one path, and why we publish the scores that fail.",
};

const BELIEFS = [
  {
    title: "Honesty over highlight reels",
    body: "We publish weak scores. Round one: none of 18 concepts cleared 90/100. Perfect totals do not exist in the wild — and pretending they do is marketing, not judgment.",
  },
  {
    title: "Niches over noise",
    body: "Built for operators who pick one niche and ship. Not for scrollers collecting tabs. If a concept fails the gates, you see why before you spend a quarter.",
  },
  {
    title: "Two planes, one motion",
    body: "Research without a stack is a bookmark. A stack without research is a hobby. Vault decides. Foundry delivers. Same brand, same standard.",
  },
];

const REFUSALS = [
  "Inflating scores to hit a vanity bar",
  "Hiding the anti-portfolio",
  "Idea lists with no kill criteria",
  "A kit that still leaves you wiring auth on a Saturday",
  "Theater instead of go/no-go",
];

export default function AboutPage() {
  return (
    <>
      <RevealObserver />
      <Nav />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <section className="page-hero">
          <p className="page-kicker animate-rise">
            <Link href="/" className="page-crumb">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            About
          </p>
          <h1 className="animate-rise-delay mt-3">About us</h1>
          <div className="rule mt-6 max-w-xs" />
          <p className="animate-rise-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-[var(--support)]">
            {BRAND.story.lede}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vault" className="btn-primary">
              Enter Vault →
            </Link>
            <Link href="/foundry" className="btn-ghost">
              Open Foundry →
            </Link>
          </div>
        </section>

        <section className="mega-split" data-reveal>
          <div className="mega-split-visual" aria-hidden="true">
            <TrackField intensity="stage" motif="orbit" />
          </div>
          <div className="mega-split-inner">
            <h2 className="mega-split-title" aria-label="Know then ship">
              <span className="mega-split-word">Know</span>
              <span className="mega-split-word mega-split-word-accent">then ship</span>
            </h2>
            <p className="mega-split-copy">{BRAND.tagline}</p>
          </div>
        </section>

        <section className="story-plane" id="story" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">Brand story</p>
            <h2 className="story-title">{BRAND.story.headline}</h2>
            <p className="story-lede">{BRAND.story.origin}</p>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-[var(--support)]">
              The name is the brief. <strong className="text-[var(--ink)]">Gitosha</strong> is not a
              moodboard word. It is the path written in three beats: insight, the crossing, the craft.
              {BRAND.chatName} sits on the site as the guide — blunt answers on product, pricing, and
              method. No mystic. No unicorn theater. A studio that sells judgment, then a zip that
              already takes payments.
            </p>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">The name</p>
            <h2 className="story-title">G · To · Sha</h2>
            <p className="story-lede">
              Three beats. Two products. One standard: decide in a sitting, then ship on a stack that
              is already live.
            </p>
            <div className="who-grid mt-10">
              {BRAND.story.nameParts.map((part) => (
                <div key={part.mark} className="who-cell">
                  <p className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)]">
                    <span className="bg-[var(--brass)] px-2">{part.mark}</span>
                  </p>
                  <p className="who-title mt-4">{part.title}</p>
                  <p className="who-body">{part.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-plane" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What we believe</p>
            <h2 className="story-title">Judgment you can reuse.</h2>
            <p className="story-lede">
              Same rubric every week. Same kill language. Same delivery plane. The brand is the
              discipline — not a manifesto poster.
            </p>
            <div className="walk-grid mt-10">
              {BELIEFS.map((item) => (
                <div key={item.title} className="walk-cell">
                  <p className="walk-title">{item.title}</p>
                  <p className="walk-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-plane story-plane-alt" data-reveal>
          <div className="story-inner">
            <p className="story-kicker">What we refuse</p>
            <h2 className="story-title">The anti-story.</h2>
            <p className="story-lede">
              If it sounds like a highlight reel, it is not us. The brand is as much about what we
              will not ship as what we will.
            </p>
            <ul className="mt-8 max-w-2xl space-y-3 text-lg leading-snug text-[var(--support)]">
              {REFUSALS.map((line) => (
                <li key={line} className="border-l-2 border-[var(--brass)] pl-4">
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/method" className="story-link">
                Read the method →
              </Link>
              <Link href="/pricing" className="story-link story-link-dim">
                Pricing →
              </Link>
            </div>
          </div>
        </section>

        <section className="closing" data-reveal>
          <div className="closing-inner">
            <h2 className="closing-title">Know what to build. Then ship it.</h2>
            <div className="closing-cta">
              <Link href="/vault" className="btn-primary">
                Start in Vault →
              </Link>
              <Link href="/foundry" className="btn-ghost">
                Open Foundry
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
