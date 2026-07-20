import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-neutral-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Shipyard
        </Link>
        <div className="flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/vault" className="hover:text-white">
            Vault
          </Link>
          <Link href="/foundry-kit" className="hover:text-white">
            Foundry Kit
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-neutral-950 hover:bg-neutral-200"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
