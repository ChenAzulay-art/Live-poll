import type { ResultOption } from "@/lib/db/queries";

export function PollResults({
  options,
  total,
  selectedOptionId,
  votingEnabled = false,
  pending = false,
  onVote,
}: {
  options: ResultOption[];
  total: number;
  selectedOptionId?: string | null;
  votingEnabled?: boolean;
  pending?: boolean;
  onVote?: (optionId: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((option) => {
        const percent =
          total === 0 ? 0 : Math.round((option.votes / total) * 100);
        const selected = selectedOptionId === option.id;
        const interactive = Boolean(
          votingEnabled && !selectedOptionId && !pending && onVote,
        );

        return (
          <button
            key={option.id}
            type="button"
            disabled={!interactive}
            onClick={() => onVote?.(option.id)}
            className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${
              selected
                ? "border-amber-400 bg-amber-400/10"
                : "border-zinc-700 bg-zinc-900"
            } ${interactive ? "hover:border-amber-300" : "cursor-default"}`}
          >
            <span
              className="absolute inset-y-0 left-0 bg-amber-400/20"
              style={{ width: `${percent}%` }}
            />
            <span className="relative flex items-center justify-between gap-4">
              <span className="text-lg font-semibold tracking-tight text-zinc-50">
                {option.label}
              </span>
              <span className="text-sm font-medium text-zinc-300">
                {option.votes} · {percent}%
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
