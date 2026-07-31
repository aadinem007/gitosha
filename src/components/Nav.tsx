"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/vault", label: BRAND.products.vault, match: (path: string) => path === "/vault" || path.startsWith("/research") },
  { href: "/foundry", label: BRAND.products.foundry, match: (path: string) => path === "/foundry" || path.startsWith("/foundry-kit") },
  { href: "/method", label: "Method", match: (path: string) => path === "/method" },
  { href: "/pricing", label: "Pricing", match: (path: string) => path === "/pricing" },
] as const;

export function Nav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // Focus first drawer link for keyboard users
    requestAnimationFrame(() => firstLinkRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <header className="site-nav">
      <nav className="site-nav-inner" aria-label="Primary">
        <Link href="/" className="site-nav-brand" aria-label={`${BRAND.name} — Home`} onClick={close}>
          {BRAND.name}
        </Link>

        <div className="site-nav-links site-nav-links-desktop">
          {NAV_LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/login" className="site-nav-signin">
            Sign in
          </Link>
        </div>

        <div className="site-nav-mobile-actions">
          <Link href="/login" className="site-nav-signin site-nav-signin-compact">
            Sign in
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="site-nav-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="site-nav-toggle-bars" aria-hidden="true">
              <span className={open ? "is-open" : undefined} />
              <span className={open ? "is-open" : undefined} />
              <span className={open ? "is-open" : undefined} />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`site-nav-backdrop${open ? " is-open" : ""}`}
        hidden={!open}
        onClick={close}
        aria-hidden="true"
      />

      <div
        id={panelId}
        className={`site-nav-drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
      >
        <div className="site-nav-drawer-inner">
          {NAV_LINKS.map((link, i) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={link.href}
                className={`site-nav-drawer-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={close}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/login" className="site-nav-signin site-nav-drawer-signin" onClick={close}>
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
