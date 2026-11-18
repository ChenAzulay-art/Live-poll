import type { ReactNode } from "react";
import Link from "next/link";
import { logoutDj } from "@/app/actions";
import { requireDjSession } from "@/lib/auth/cookies";
import { BrandMark } from "@/components/brand-mark";

export default async function DjLayout({ children }: { children: ReactNode }) {
  await requireDjSession();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-paper/10 px-6 py-4">
        <BrandMark />
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="text-mute hover:text-paper">
            User login
          </Link>
          <Link href="/dj" className="text-mute hover:text-paper">
            Live
          </Link>
          <Link href="/dj/artists" className="text-mute hover:text-paper">
            Artists
          </Link>
          <form action={logoutDj}>
            <button type="submit" className="text-mute hover:text-paper">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <div className="flex flex-1 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
