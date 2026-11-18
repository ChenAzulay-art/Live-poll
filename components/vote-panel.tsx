"use client";

import { useActionState } from "react";
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
  const [state, action, pending] = useActionState(submitVoteAction, null);
  usePauseLiveRefresh(pending);

  return (
    <div className="flex flex-col gap-3">
      <PollResults
        options={options}
        total={total}
        selectedOptionId={selectedOptionId}
        pollId={pollId}
        voteAction={action}
        votingEnabled
        pending={pending}
      />
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
    </div>
  );
}
