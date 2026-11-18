import { LiveRefresh } from "@/components/live-refresh";
import { PollTimer } from "@/components/poll-timer";
import { PollWinner } from "@/components/poll-winner";
import { VotePanel } from "@/components/vote-panel";
import { PollResults } from "@/components/poll-results";
import { BrandMark } from "@/components/brand-mark";
import { DisplayTitle } from "@/components/display-title";
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
  const [{ db }, voterId] = await Promise.all([getDb(), getVoterId()]);
  const event = await getEventByCode(db, code);

  if (!event) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <BrandMark />
        <DisplayTitle text="Night not found." />
        <p className="text-mute">Check the code and try again.</p>
      </main>
    );
  }

  const openPoll = await getOpenPoll(db, event.id);
  const closedPoll = openPoll ? null : await getLatestClosedPoll(db, event.id);
  const displayPoll = openPoll ?? closedPoll;
  const [results, vote] = await Promise.all([
    displayPoll ? getPollResults(db, displayPoll.id) : Promise.resolve(null),
    openPoll && voterId
      ? getVoterChoice(db, openPoll.id, voterId)
      : Promise.resolve(null),
  ]);
  const deadline = openPoll ? closesAt(openPoll.openedAt) : null;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-10">
      <LiveRefresh />
      <div className="flex items-center justify-between gap-4">
        <BrandMark />
        <p className="rounded-full border border-acid px-3 py-1 text-xs font-semibold tracking-[0.22em] text-acid">
          {event.code}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-mute">
          {event.name}
        </p>
        <DisplayTitle text={displayPoll?.question ?? "Waiting for the DJ"} />
        {openPoll && deadline ? <PollTimer closesAt={deadline} /> : null}
        {results ? (
          <p className="text-sm text-mute">
            {results.total} vote{results.total === 1 ? "" : "s"}
            {openPoll ? (vote ? " · You’re in" : " · Tap an artist") : ""}
          </p>
        ) : (
          <p className="text-sm text-mute">The DJ is cueing the next record.</p>
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
