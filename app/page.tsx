import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { DisplayTitle } from "@/components/display-title";
import { JoinForm } from "@/components/join-form";
import { PosterBackdrop } from "@/components/poster-backdrop";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <PosterBackdrop />
      <header className="relative z-10 px-6 pt-10">
        <BrandMark />
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-end gap-8 px-6 pb-12">
        <div className="flex flex-col gap-4">
          <DisplayTitle text="Who's next." className="text-6xl sm:text-7xl" />
          <p className="max-w-xs text-sm leading-relaxed text-mute">
            Fresh artists. Live votes. Your next favorite on the floor.
          </p>
        </div>
        <JoinForm />
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/vote/NIGHT"
            className="text-sm font-medium text-mute underline-offset-4 hover:text-paper hover:underline"
          >
            Guest page
          </Link>
          <Link
            href="/dj/login"
            className="text-sm font-medium text-mute underline-offset-4 hover:text-paper hover:underline"
          >
            DJ login
          </Link>
        </div>
      </main>
    </div>
  );
}
