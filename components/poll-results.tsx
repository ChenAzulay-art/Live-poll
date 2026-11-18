"use client";

import type { ResultOption } from "@/lib/db/queries";

export function PollResults({
  options,
  total,
  selectedOptionId,
  votingEnabled = false,
  pending = false,
  pollId,
  voteAction,
}: {
  options: ResultOption[];
  total: number;
  selectedOptionId?: string | null;
  votingEnabled?: boolean;
  pending?: boolean;
  pollId?: string;
  voteAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((option) => {
        const percent =
          total === 0 ? 0 : Math.round((option.votes / total) * 100);
        const selected = selectedOptionId === option.id;
        const interactive = Boolean(
          votingEnabled &&
          !selectedOptionId &&
          !pending &&
          voteAction &&
          pollId,
        );
        const className = `relative overflow-hidden rounded-sm px-5 py-5 text-left transition ${
          selected ? "bg-acid text-night" : "bg-paper/5 text-paper"
        } ${interactive ? "hover:bg-acid/20" : "cursor-default"}`;

        const body = (
          <>
            <span
              className={`absolute inset-y-0 left-0 ${
                selected ? "bg-night/10" : "bg-acid/40"
              }`}
              style={{ width: `${percent}%` }}
            />
            <span className="relative flex items-center justify-between gap-4">
              <span className="font-display text-2xl tracking-tight">
                {option.label}
              </span>
              <span
                className={`text-sm font-medium ${
                  selected ? "text-night/70" : "text-mute"
                }`}
              >
                {option.votes} · {percent}%
              </span>
            </span>
          </>
        );

        if (interactive) {
          return (
            <form action={voteAction} key={option.id}>
              <input type="hidden" name="pollId" value={pollId} />
              <input type="hidden" name="optionId" value={option.id} />
              <button type="submit" className={`w-full ${className}`}>
                {body}
              </button>
            </form>
          );
        }

        return (
          <button key={option.id} type="button" disabled className={className}>
            {body}
          </button>
        );
      })}
    </div>
  );
}
