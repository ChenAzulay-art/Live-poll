import type { ReactNode } from "react";
import Link from "next/link";
import { logoutDj } from "@/app/actions";
import { requireDjSession } from "@/lib/auth/cookies";

export default async function DjLayout({ children }: { children: ReactNode }) {
  await requireDjSession();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4">
        <p className="font-semibold tracking-tight">DJ booth</p>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dj" className="text-zinc-300 hover:text-white">
            Live
          </Link>
          <Link href="/dj/artists" className="text-zinc-300 hover:text-white">
            Artists
          </Link>
          <form action={logoutDj}>
            <button type="submit" className="text-zinc-500 hover:text-zinc-300">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <div className="flex flex-1 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
