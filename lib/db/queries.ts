import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { artists, events, pollOptions, polls, votes } from "@/lib/db/schema";
import { createId } from "@/lib/ids";
import { drawArtists } from "@/lib/poll/draw";
import { isExpired } from "@/lib/poll/timer";
import {
  assertCanClose,
  assertCanDeleteArtist,
  assertCanOpen,
  assertCanRedraw,
  assertCanVote,
  PollRuleError,
} from "@/lib/poll/rules";
import type * as schema from "@/lib/db/schema";

export type Db = LibSQLDatabase<typeof schema>;

export type ResultOption = {
  id: string;
  artistId: string;
  label: string;
  votes: number;
};

const DEFAULT_QUESTION = "Who's next?";

export async function getEventByCode(db: Db, code: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.code, code.toUpperCase()))
    .limit(1);
  return event ?? null;
}

export async function getDefaultEvent(db: Db) {
  const [event] = await db
    .select()
    .from(events)
    .orderBy(asc(events.createdAt))
    .limit(1);
  return event ?? null;
}

export async function listArtists(db: Db, eventId: string) {
  return db
    .select()
    .from(artists)
    .where(eq(artists.eventId, eventId))
    .orderBy(asc(artists.position), asc(artists.createdAt));
}

export async function addArtist(db: Db, eventId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new PollRuleError("Artist name cannot be empty.");
  }

  const existing = await listArtists(db, eventId);
  const position =
    existing.length === 0 ? 0 : existing[existing.length - 1].position + 1;

  await db.insert(artists).values({
    id: createId(),
    eventId,
    name: trimmed,
    position,
    createdAt: Date.now(),
  });
}

export async function renameArtist(db: Db, artistId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new PollRuleError("Artist name cannot be empty.");
  }
  await db
    .update(artists)
    .set({ name: trimmed })
    .where(eq(artists.id, artistId));
}

export async function removeArtist(db: Db, artistId: string) {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.id, artistId))
    .limit(1);
  if (!artist) {
    return;
  }

  const references = await db
    .select({
      pollId: pollOptions.pollId,
      status: polls.status,
    })
    .from(pollOptions)
    .innerJoin(polls, eq(polls.id, pollOptions.pollId))
    .where(eq(pollOptions.artistId, artistId));

  const lockedPollArtistIds = references.some(
    (row) => row.status === "open" || row.status === "closed",
  )
    ? [artistId]
    : [];
  assertCanDeleteArtist({ artistId, lockedPollArtistIds });

  const draftPollIds = [
    ...new Set(
      references
        .filter((row) => row.status === "draft")
        .map((row) => row.pollId),
    ),
  ];

  if (draftPollIds.length > 0) {
    await db
      .delete(pollOptions)
      .where(
        and(
          eq(pollOptions.artistId, artistId),
          inArray(pollOptions.pollId, draftPollIds),
        ),
      );

    for (const pollId of draftPollIds) {
      const remaining = await listPollOptions(db, pollId);
      if (remaining.length < 2) {
        await db.delete(polls).where(eq(polls.id, pollId));
      }
    }
  }

  await db.delete(artists).where(eq(artists.id, artistId));
}

export async function moveArtist(
  db: Db,
  artistId: string,
  direction: "up" | "down",
) {
  const [artist] = await db
    .select()
    .from(artists)
    .where(eq(artists.id, artistId))
    .limit(1);
  if (!artist) {
    throw new PollRuleError("Artist not found.");
  }

  const roster = await listArtists(db, artist.eventId);
  const index = roster.findIndex((item) => item.id === artistId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= roster.length) {
    return;
  }

  const other = roster[swapWith];
  await db
    .update(artists)
    .set({ position: other.position })
    .where(eq(artists.id, artist.id));
  await db
    .update(artists)
    .set({ position: artist.position })
    .where(eq(artists.id, other.id));
}

export async function getOpenPoll(db: Db, eventId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(and(eq(polls.eventId, eventId), eq(polls.status, "open")))
    .limit(1);
  if (!poll) {
    return null;
  }
  if (isExpired(poll.openedAt)) {
    await closePoll(db, poll.id);
    return null;
  }
  return poll;
}

export async function getLatestClosedPoll(db: Db, eventId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(and(eq(polls.eventId, eventId), eq(polls.status, "closed")))
    .orderBy(desc(polls.createdAt))
    .limit(1);
  return poll ?? null;
}

export async function getDraftPoll(db: Db, eventId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(and(eq(polls.eventId, eventId), eq(polls.status, "draft")))
    .orderBy(desc(polls.createdAt))
    .limit(1);
  return poll ?? null;
}

export async function listPollOptions(db: Db, pollId: string) {
  return db
    .select()
    .from(pollOptions)
    .where(eq(pollOptions.pollId, pollId))
    .orderBy(asc(pollOptions.position));
}

export async function getUsedArtistIds(
  db: Db,
  eventId: string,
  excludePollId?: string,
) {
  const eventPolls = await db
    .select({ id: polls.id })
    .from(polls)
    .where(eq(polls.eventId, eventId));
  const pollIds = eventPolls
    .map((poll) => poll.id)
    .filter((id) => id !== excludePollId);
  if (pollIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ artistId: pollOptions.artistId })
    .from(pollOptions)
    .where(inArray(pollOptions.pollId, pollIds));

  return [...new Set(rows.map((row) => row.artistId))];
}

async function insertDrawnOptions(
  db: Db,
  pollId: string,
  drawn: { id: string; name: string }[],
) {
  if (drawn.length === 0) {
    return;
  }
  await db.insert(pollOptions).values(
    drawn.map((artist, position) => ({
      id: createId(),
      pollId,
      artistId: artist.id,
      label: artist.name,
      position,
    })),
  );
}

export async function drawNextPoll(db: Db, eventId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) {
    throw new PollRuleError("Event not found.");
  }

  const roster = await listArtists(db, eventId);
  const existingDraft = await getDraftPoll(db, eventId);
  if (existingDraft) {
    return redrawPoll(db, existingDraft.id);
  }

  const usedArtistIds = await getUsedArtistIds(db, eventId);
  const drawn = drawArtists({
    roster,
    usedArtistIds,
    drawSize: event.drawSize,
  });

  const [{ maxPosition }] = await db
    .select({ maxPosition: sql<number>`coalesce(max(${polls.position}), -1)` })
    .from(polls)
    .where(eq(polls.eventId, eventId));

  const pollId = createId();
  await db.insert(polls).values({
    id: pollId,
    eventId,
    question: DEFAULT_QUESTION,
    status: "draft",
    position: (maxPosition ?? -1) + 1,
    createdAt: Date.now(),
  });
  await insertDrawnOptions(db, pollId, drawn);

  const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
  return poll;
}

export async function redrawPoll(db: Db, pollId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);
  if (!poll) {
    throw new PollRuleError("Poll not found.");
  }
  assertCanRedraw(poll.status);

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, poll.eventId))
    .limit(1);
  if (!event) {
    throw new PollRuleError("Event not found.");
  }

  const roster = await listArtists(db, poll.eventId);
  const usedArtistIds = await getUsedArtistIds(db, poll.eventId, poll.id);
  const drawn = drawArtists({
    roster,
    usedArtistIds,
    drawSize: event.drawSize,
  });

  await db.delete(pollOptions).where(eq(pollOptions.pollId, poll.id));
  await insertDrawnOptions(db, poll.id, drawn);
  return poll;
}

export async function openPoll(db: Db, pollId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);
  if (!poll) {
    throw new PollRuleError("Poll not found.");
  }
  assertCanOpen(poll.status);

  await db
    .update(polls)
    .set({ status: "closed" })
    .where(and(eq(polls.eventId, poll.eventId), eq(polls.status, "open")));
  await db
    .update(polls)
    .set({ status: "open", openedAt: Date.now() })
    .where(eq(polls.id, poll.id));
}

export async function closePoll(db: Db, pollId: string) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .limit(1);
  if (!poll) {
    throw new PollRuleError("Poll not found.");
  }
  assertCanClose(poll.status);
  await db.update(polls).set({ status: "closed" }).where(eq(polls.id, poll.id));
}

export async function getPollResults(
  db: Db,
  pollId: string,
): Promise<{
  options: ResultOption[];
  total: number;
}> {
  const options = await listPollOptions(db, pollId);
  const voteRows = await db
    .select({
      optionId: votes.optionId,
      count: count(votes.id),
    })
    .from(votes)
    .where(eq(votes.pollId, pollId))
    .groupBy(votes.optionId);

  const counts = new Map(voteRows.map((row) => [row.optionId, row.count]));
  const resultOptions = options.map((option) => ({
    id: option.id,
    artistId: option.artistId,
    label: option.label,
    votes: counts.get(option.id) ?? 0,
  }));
  const total = resultOptions.reduce((sum, option) => sum + option.votes, 0);
  return { options: resultOptions, total };
}

export async function getVoterChoice(db: Db, pollId: string, voterId: string) {
  const [vote] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.pollId, pollId), eq(votes.voterId, voterId)))
    .limit(1);
  return vote ?? null;
}

export async function submitVote(
  db: Db,
  input: { pollId: string; optionId: string; voterId: string },
) {
  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.id, input.pollId))
    .limit(1);
  if (!poll) {
    throw new PollRuleError("Poll not found.");
  }

  if (poll.status === "open" && isExpired(poll.openedAt)) {
    await closePoll(db, poll.id);
    throw new PollRuleError("Voting has closed.");
  }

  const [option] = await db
    .select()
    .from(pollOptions)
    .where(eq(pollOptions.id, input.optionId))
    .limit(1);
  if (!option) {
    throw new PollRuleError("That artist is not part of this poll.");
  }

  const existing = await getVoterChoice(db, input.pollId, input.voterId);
  assertCanVote({
    pollStatus: poll.status,
    optionPollId: option.pollId,
    pollId: input.pollId,
    alreadyVoted: Boolean(existing),
  });

  try {
    await db.insert(votes).values({
      id: createId(),
      pollId: input.pollId,
      optionId: input.optionId,
      voterId: input.voterId,
      createdAt: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.toLowerCase().includes("unique")) {
      throw new PollRuleError("You already voted in this poll.");
    }
    throw error;
  }
}

export async function countOpenPolls(db: Db, eventId: string) {
  const [row] = await db
    .select({ value: count(polls.id) })
    .from(polls)
    .where(and(eq(polls.eventId, eventId), eq(polls.status, "open")));
  return row?.value ?? 0;
}

export async function listPolls(db: Db, eventId: string) {
  return db
    .select()
    .from(polls)
    .where(eq(polls.eventId, eventId))
    .orderBy(desc(polls.createdAt));
}
