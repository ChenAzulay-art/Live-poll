"use client";

import { useActionState } from "react";
import {
  closePollAction,
  drawPollAction,
  openPollAction,
  redrawPollAction,
} from "@/app/actions";
import { usePauseLiveRefresh } from "@/components/live-refresh";

const acidButton =
  "h-12 rounded-full bg-acid px-5 font-semibold text-night disabled:opacity-60";
const ghostButton =
  "h-12 rounded-full border border-paper/30 px-5 font-semibold text-paper disabled:opacity-60";

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
          <button type="submit" disabled={pending} className={acidButton}>
            Draw next poll →
          </button>
        </form>
        {draftPollId ? (
          <>
            <form action={redrawAction}>
              <input type="hidden" name="pollId" value={draftPollId} />
              <button type="submit" disabled={pending} className={ghostButton}>
                Redraw
              </button>
            </form>
            <form action={openAction}>
              <input type="hidden" name="pollId" value={draftPollId} />
              <button type="submit" disabled={pending} className={acidButton}>
                Open poll →
              </button>
            </form>
          </>
        ) : null}
        {openPollId ? (
          <form action={closeAction}>
            <input type="hidden" name="pollId" value={openPollId} />
            <button type="submit" disabled={pending} className={ghostButton}>
              Close poll
            </button>
          </form>
        ) : null}
      </div>
      {error ? <p className="text-sm text-acid">{error}</p> : null}
    </div>
  );
}
