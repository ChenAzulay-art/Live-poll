"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        This page couldn&apos;t load
      </h1>
      <p className="text-zinc-400">
        {error.message || "A server error occurred. Reload to try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-11 w-fit rounded-xl bg-purple-400 px-4 font-semibold text-zinc-950"
      >
        Try again
      </button>
    </main>
  );
}
