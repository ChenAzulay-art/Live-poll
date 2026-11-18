import type { ResultOption } from "@/lib/db/queries";
import { winningOptions } from "@/lib/poll/timer";

function TrophyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-9 w-9 shrink-0 text-night"
      fill="currentColor"
    >
      <path d="M7 4h10v2h3a1 1 0 0 1 1 1v2a5 5 0 0 1-4.1 4.9A5 5 0 0 1 13 16.9V18h3v2H8v-2h3v-1.1A5 5 0 0 1 7.1 13.9 5 5 0 0 1 3 9V7a1 1 0 0 1 1-1h3V4zm0 4H5v1a3 3 0 0 0 2.8 3H8A4 4 0 0 1 7 8zm10 0a4 4 0 0 1-.8 4h.2A3 3 0 0 0 19 9V8h-2z" />
    </svg>
  );
}

export function PollWinner({
  options,
  total,
}: {
  options: ResultOption[];
  total: number;
}) {
  const winners = winningOptions(options, total);

  if (winners.length === 0) {
    return (
      <div className="bg-paper/5 px-6 py-8 text-center">
        <p className="font-display text-2xl text-paper">No votes this round</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-acid px-6 py-8 text-night">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.22em]">
        Winner
      </p>
      {winners.map((winner) => (
        <div key={winner.id} className="flex items-center justify-center gap-3">
          <TrophyIcon />
          <p className="font-display text-4xl leading-none tracking-tight">
            {winner.label}
          </p>
        </div>
      ))}
    </div>
  );
}
