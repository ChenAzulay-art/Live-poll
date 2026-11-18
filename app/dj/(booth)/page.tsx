import { headers } from "next/headers";
import Link from "next/link";
import { DashboardControls } from "@/components/dashboard-controls";
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
    return <p className="text-zinc-400">No event is set up yet.</p>;
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
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-400">
            {STAGE_LABEL[stage]}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {openPoll?.question ??
              draftPoll?.question ??
              closedPoll?.question ??
              "Draw a poll to start"}
          </h1>
          {openPoll && deadline ? (
            <PollTimer closesAt={deadline} compact />
          ) : null}
          <p className="text-zinc-400">
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
          <ul className="flex flex-col gap-2 text-lg">
            {draftOptions.map((option) => (
              <li
                key={option.id}
                className="rounded-xl border border-zinc-800 px-4 py-3"
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
          <p className="text-zinc-500">
            Add artists, then draw a poll. Redraw until you like the lineup,
            then open it.
          </p>
        )}
      </section>
      <aside className="flex w-full flex-col items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 lg:w-72">
        <p className="text-sm font-medium text-zinc-400">Crowd URL</p>
        <p className="text-3xl font-semibold tracking-[0.25em] text-purple-400">
          {event.code}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="QR code for the voting page"
          className="rounded-xl"
        />
        <Link
          href={`/vote/${event.code}`}
          className="text-sm font-medium text-purple-300 underline-offset-4 hover:text-purple-200 hover:underline"
        >
          Open guest page
        </Link>
        <a
          href={voteUrl}
          className="break-all text-center text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
        >
          {voteUrl}
        </a>
      </aside>
    </main>
  );
}
