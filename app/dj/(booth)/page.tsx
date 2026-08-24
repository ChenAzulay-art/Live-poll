import QRCode from "qrcode";
import { headers } from "next/headers";
import { DashboardControls } from "@/components/dashboard-controls";
import { LiveRefresh } from "@/components/live-refresh";
import { PollResults } from "@/components/poll-results";
import { getDb } from "@/lib/db/client";
import {
  getDefaultEvent,
  getDraftPoll,
  getOpenPoll,
  getPollResults,
  listPollOptions,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

async function appUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export default async function DjDashboardPage() {
  const { db } = await getDb();
  const event = await getDefaultEvent(db);
  if (!event) {
    return <p className="text-zinc-400">No event is set up yet.</p>;
  }

  const [openPoll, draftPoll] = await Promise.all([
    getOpenPoll(db, event.id),
    getDraftPoll(db, event.id),
  ]);
  const activePoll = openPoll ?? draftPoll;
  const results = activePoll ? await getPollResults(db, activePoll.id) : null;
  const draftOptions = draftPoll ? await listPollOptions(db, draftPoll.id) : [];

  const voteUrl = `${await appUrl()}/vote/${event.code}`;
  const qrDataUrl = await QRCode.toDataURL(voteUrl, {
    margin: 1,
    width: 220,
    color: { dark: "#09090b", light: "#c084fc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
      <LiveRefresh />
      <section className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-400">
            {openPoll ? "Live" : draftPoll ? "Draft" : "Waiting"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {activePoll?.question ?? "Draw a poll to start"}
          </h1>
          <p className="text-zinc-400">
            {results
              ? `${results.total} vote${results.total === 1 ? "" : "s"}`
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
        <p className="break-all text-center text-xs text-zinc-500">{voteUrl}</p>
      </aside>
    </main>
  );
}
