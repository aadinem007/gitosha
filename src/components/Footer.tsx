export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Shipyard</p>
        <div className="flex gap-5">
          <a href="/method" className="hover:text-[var(--ink)]">
            Method
          </a>
          <a href="/security" className="hover:text-[var(--ink)]">
            Security
          </a>
          <a href="mailto:aaditya.shah8005@gmail.com" className="hover:text-[var(--ink)]">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
