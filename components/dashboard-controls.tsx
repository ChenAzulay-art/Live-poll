"use client";

import { useActionState } from "react";
import {
  closePollAction,
  drawPollAction,
  openPollAction,
  redrawPollAction,
} from "@/app/actions";
import { usePauseLiveRefresh } from "@/components/live-refresh";

export function DashboardControls({
  draftPollId,
  openPollId,
}: {
  draftPollId: string | null;
  openPollId: string | null;
}) {
  const [drawState, drawAction, drawPending] = useActionState(
    drawPollAction,
    null,
  );
  const [redrawState, redrawAction, redrawPending] = useActionState(
    redrawPollAction,
    null,
  );
  const [openState, openAction, openPending] = useActionState(
    openPollAction,
    null,
  );
  const [closeState, closeAction, closePending] = useActionState(
    closePollAction,
    null,
  );
  const pending = drawPending || redrawPending || openPending || closePending;
  usePauseLiveRefresh(pending);
  const error =
    drawState?.error ??
    redrawState?.error ??
    openState?.error ??
    closeState?.error;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <form action={drawAction}>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-xl bg-purple-400 px-4 font-semibold text-zinc-950 disabled:opacity-60"
          >
            Draw next poll
          </button>
        </form>
        {draftPollId ? (
          <>
            <form action={redrawAction}>
              <input type="hidden" name="pollId" value={draftPollId} />
              <button
                type="submit"
                disabled={pending}
                className="h-11 rounded-xl border border-zinc-600 px-4 font-semibold text-zinc-100 disabled:opacity-60"
              >
                Redraw
              </button>
            </form>
            <form action={openAction}>
              <input type="hidden" name="pollId" value={draftPollId} />
              <button
                type="submit"
                disabled={pending}
                className="h-11 rounded-xl bg-emerald-400 px-4 font-semibold text-zinc-950 disabled:opacity-60"
              >
                Open poll
              </button>
            </form>
          </>
        ) : null}
        {openPollId ? (
          <form action={closeAction}>
            <input type="hidden" name="pollId" value={openPollId} />
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-xl border border-rose-400 px-4 font-semibold text-rose-200 disabled:opacity-60"
            >
              Close poll
            </button>
          </form>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
