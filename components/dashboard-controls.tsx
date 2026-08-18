"use client";

import { useState, useTransition } from "react";
import {
  closePollAction,
  drawPollAction,
  openPollAction,
  redrawPollAction,
} from "@/app/actions";

export function DashboardControls({
  draftPollId,
  openPollId,
}: {
  draftPollId: string | null;
  openPollId: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | null>) {
    startTransition(async () => {
      const result = await action();
      setError(result?.error ?? null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => drawPollAction())}
          className="h-11 rounded-xl bg-amber-400 px-4 font-semibold text-zinc-950 disabled:opacity-60"
        >
          Draw next poll
        </button>
        {draftPollId ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => redrawPollAction(draftPollId))}
              className="h-11 rounded-xl border border-zinc-600 px-4 font-semibold text-zinc-100 disabled:opacity-60"
            >
              Redraw
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => openPollAction(draftPollId))}
              className="h-11 rounded-xl bg-emerald-400 px-4 font-semibold text-zinc-950 disabled:opacity-60"
            >
              Open poll
            </button>
          </>
        ) : null}
        {openPollId ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => closePollAction(openPollId))}
            className="h-11 rounded-xl border border-rose-400 px-4 font-semibold text-rose-200 disabled:opacity-60"
          >
            Close poll
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
