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
      <h1 className="font-display text-4xl tracking-tight text-paper">
        This page couldn&apos;t load
      </h1>
      <p className="text-mute">
        {error.message || "A server error occurred. Reload to try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="h-12 w-fit rounded-full bg-acid px-5 font-semibold text-night"
      >
        Try again →
      </button>
    </main>
  );
}
