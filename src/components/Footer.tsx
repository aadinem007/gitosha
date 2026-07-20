export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Shipyard. Built in the open.</p>
        <div className="flex gap-5">
          <a href="mailto:hello@shipyard.build" className="hover:text-neutral-300">
            hello@shipyard.build
          </a>
          <a href="https://twitter.com" className="hover:text-neutral-300">
            X / Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
