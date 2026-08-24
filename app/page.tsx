import Link from "next/link";
import { JoinForm } from "@/components/join-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-400">
            Live poll
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Who&apos;s next?
          </h1>
          <p className="text-zinc-400">
            Enter tonight&apos;s code to vote, or open the booth if you&apos;re
            the DJ.
          </p>
        </div>
        <JoinForm />
        <Link
          href="/dj/login"
          className="text-center text-sm font-medium text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
        >
          DJ login
        </Link>
      </main>
    </div>
  );
}
