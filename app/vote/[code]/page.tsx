import { LiveRefresh } from "@/components/live-refresh";
import { PollTimer } from "@/components/poll-timer";
import { PollWinner } from "@/components/poll-winner";
import { VotePanel } from "@/components/vote-panel";
import { PollResults } from "@/components/poll-results";
import { getDb } from "@/lib/db/client";
import { getVoterId } from "@/lib/auth/cookies";
import {
  getEventByCode,
  getLatestClosedPoll,
  getOpenPoll,
  getPollResults,
  getVoterChoice,
} from "@/lib/db/queries";
import { closesAt } from "@/lib/poll/timer";

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { db } = await getDb();
  const event = await getEventByCode(db, code);

  if (!event) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Night not found</h1>
        <p className="text-zinc-400">Check the code and try again.</p>
      </main>
    );
  }

  const openPoll = await getOpenPoll(db, event.id);
  const closedPoll = openPoll ? null : await getLatestClosedPoll(db, event.id);
  const displayPoll = openPoll ?? closedPoll;
  const voterId = await getVoterId();
  const results = displayPoll ? await getPollResults(db, displayPoll.id) : null;
  const vote =
    openPoll && voterId ? await getVoterChoice(db, openPoll.id, voterId) : null;
  const deadline = openPoll ? closesAt(openPoll.openedAt) : null;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-12">
      <LiveRefresh />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-purple-400">
          {event.name}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {displayPoll?.question ?? "Waiting for the DJ"}
        </h1>
        {openPoll && deadline ? <PollTimer closesAt={deadline} /> : null}
        {results ? (
          <p className="text-zinc-400">
            {results.total} vote{results.total === 1 ? "" : "s"}
            {openPoll ? (vote ? " · You’re in" : " · Tap an artist") : ""}
          </p>
        ) : (
          <p className="text-zinc-400">
            A poll will show up here when the DJ opens it.
          </p>
        )}
      </div>
      {closedPoll && results ? (
        <PollWinner options={results.options} total={results.total} />
      ) : null}
      {openPoll && results ? (
        <VotePanel
          pollId={openPoll.id}
          options={results.options}
          total={results.total}
          selectedOptionId={vote?.optionId ?? null}
        />
      ) : null}
      {closedPoll && results ? (
        <PollResults options={results.options} total={results.total} />
      ) : null}
    </main>
  );
}
