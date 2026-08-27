"use client";

import { useState, useTransition } from "react";
import { submitVoteAction } from "@/app/actions";
import { usePauseLiveRefresh } from "@/components/live-refresh";
import { PollResults } from "@/components/poll-results";
import type { ResultOption } from "@/lib/db/queries";

export function VotePanel({
  pollId,
  options,
  total,
  selectedOptionId,
}: {
  pollId: string;
  options: ResultOption[];
  total: number;
  selectedOptionId?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  usePauseLiveRefresh(pending);

  function vote(optionId: string) {
    startTransition(async () => {
      const result = await submitVoteAction(pollId, optionId);
      setError(result?.error ?? null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <PollResults
        options={options}
        total={total}
        selectedOptionId={selectedOptionId}
        votingEnabled
        pending={pending}
        onVote={vote}
      />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
