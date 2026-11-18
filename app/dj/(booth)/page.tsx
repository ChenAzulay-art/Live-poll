import { headers } from "next/headers";
import Link from "next/link";
import { DashboardControls } from "@/components/dashboard-controls";
import { DisplayTitle } from "@/components/display-title";
import { LiveRefresh } from "@/components/live-refresh";
import { PollResults } from "@/components/poll-results";
import { PollTimer } from "@/components/poll-timer";
import { PollWinner } from "@/components/poll-winner";
import { getDb } from "@/lib/db/client";
import {
  getDefaultEvent,
  getDraftPoll,
  getLatestClosedPoll,
  getOpenPoll,
  getPollResults,
  listPollOptions,
} from "@/lib/db/queries";
import { crowdFacingHost } from "@/lib/net/lan";
import { boothStage } from "@/lib/poll/booth";
import { closesAt } from "@/lib/poll/timer";
import { voteQrDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

const STAGE_LABEL = {
  live: "Live",
  draft: "Draft",
  winner: "Winner",
  waiting: "Waiting",
} as const;

async function appUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) {
    return "http://localhost:3000";
  }
  return `${protocol}://${crowdFacingHost(host)}`;
}

export default async function DjDashboardPage() {
  const [{ db }, baseUrl] = await Promise.all([getDb(), appUrl()]);
  const event = await getDefaultEvent(db);
  if (!event) {
    return <p className="text-mute">No event is set up yet.</p>;
  }

  const [openPoll, draftPoll] = await Promise.all([
    getOpenPoll(db, event.id),
    getDraftPoll(db, event.id),
  ]);
  const closedPoll =
    openPoll || draftPoll ? null : await getLatestClosedPoll(db, event.id);
  const livePoll = openPoll ?? closedPoll;
  const voteUrl = `${baseUrl}/vote/${event.code}`;
  const [results, draftOptions, qrDataUrl] = await Promise.all([
    livePoll ? getPollResults(db, livePoll.id) : Promise.resolve(null),
    draftPoll ? listPollOptions(db, draftPoll.id) : Promise.resolve([]),
    voteQrDataUrl(voteUrl),
  ]);
  const deadline = openPoll ? closesAt(openPoll.openedAt) : null;
  const stage = boothStage({
    hasOpenPoll: Boolean(openPoll),
    hasDraftPoll: Boolean(draftPoll),
    hasClosedPoll: Boolean(closedPoll),
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
      <LiveRefresh />
      <section className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-acid">
            {STAGE_LABEL[stage]}
          </p>
          <DisplayTitle
            text={
              openPoll?.question ??
              draftPoll?.question ??
              closedPoll?.question ??
              "Draw a poll to start"
            }
            className="text-4xl sm:text-5xl"
          />
          {openPoll && deadline ? (
            <PollTimer closesAt={deadline} compact />
          ) : null}
          <p className="text-sm text-mute">
            {results
              ? `${results.total} vote${results.total === 1 ? "" : "s"}`
              : draftPoll
                ? "Not open yet"
                : "No votes yet"}
          </p>
        </div>
        <DashboardControls
          draftPollId={draftPoll?.id ?? null}
          openPollId={openPoll?.id ?? null}
        />
        {openPoll && results ? (
          <PollResults options={results.options} total={results.total} />
        ) : draftOptions.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {draftOptions.map((option) => (
              <li
                key={option.id}
                className="bg-paper/5 px-5 py-4 font-display text-2xl tracking-tight"
              >
                {option.label}
              </li>
            ))}
          </ul>
        ) : closedPoll && results ? (
          <>
            <PollWinner options={results.options} total={results.total} />
            <PollResults options={results.options} total={results.total} />
          </>
        ) : (
          <p className="text-mute">
            Add artists, then draw a poll. Redraw until you like the lineup,
            then open it.
          </p>
        )}
      </section>
      <aside className="flex w-full flex-col items-center gap-4 bg-acid p-6 text-night lg:w-72">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]">
          Crowd URL
        </p>
        <p className="font-display text-4xl tracking-[0.18em]">{event.code}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="QR code for the voting page"
          className="rounded-sm"
        />
        <Link
          href={`/vote/${event.code}`}
          className="text-sm font-semibold underline-offset-4 hover:underline"
        >
          Open guest page →
        </Link>
        <a
          href={voteUrl}
          className="break-all text-center text-xs text-night/70 underline-offset-4 hover:underline"
        >
          {voteUrl}
        </a>
      </aside>
    </main>
  );
}
