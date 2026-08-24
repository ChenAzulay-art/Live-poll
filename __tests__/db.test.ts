// @vitest-environment node
import { expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { createMemoryDb } from "@/lib/db/client";
import { events, polls } from "@/lib/db/schema";
import {
  addArtist,
  countOpenPolls,
  drawNextPoll,
  getOpenPoll,
  getPollResults,
  listArtists,
  listPollOptions,
  openPoll,
  redrawPoll,
  removeArtist,
  submitVote,
} from "@/lib/db/queries";
import { createId } from "@/lib/ids";
import { PollRuleError } from "@/lib/poll/rules";
import { POLL_DURATION_MS } from "@/lib/poll/timer";

async function createEvent(
  db: Awaited<ReturnType<typeof createMemoryDb>>["db"],
) {
  const eventId = createId();
  await db.insert(events).values({
    id: eventId,
    name: "Test night",
    code: "TEST",
    drawSize: 4,
    createdAt: Date.now(),
  });
  return eventId;
}

test("rejects duplicate artist names on the same event", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);

  await addArtist(db, eventId, "Bicep");
  await expect(addArtist(db, eventId, "Bicep")).rejects.toThrow();
});

test("allows the same artist name on different events", async () => {
  const { db } = await createMemoryDb();
  const firstEvent = await createEvent(db);
  const secondId = createId();
  await db.insert(events).values({
    id: secondId,
    name: "Another night",
    code: "OTHER",
    drawSize: 4,
    createdAt: Date.now(),
  });

  await addArtist(db, firstEvent, "Bicep");
  await addArtist(db, secondId, "Bicep");

  expect(await listArtists(db, firstEvent)).toHaveLength(1);
  expect(await listArtists(db, secondId)).toHaveLength(1);
});

test("enforces one vote per voter per poll", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await addArtist(db, eventId, "Bicep");
  await addArtist(db, eventId, "Overmono");
  await addArtist(db, eventId, "HAAi");
  await addArtist(db, eventId, "Salute");

  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  const options = await listPollOptions(db, poll.id);
  const voterId = createId();

  await submitVote(db, {
    pollId: poll.id,
    optionId: options[0].id,
    voterId,
  });

  await expect(
    submitVote(db, {
      pollId: poll.id,
      optionId: options[1].id,
      voterId,
    }),
  ).rejects.toBeInstanceOf(PollRuleError);

  const results = await getPollResults(db, poll.id);
  expect(results.total).toBe(1);
  expect(
    results.options.find((option) => option.id === options[0].id)?.votes,
  ).toBe(1);
});

test("keeps only one poll open at a time", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  for (const name of ["A", "B", "C", "D", "E", "F"]) {
    await addArtist(db, eventId, name);
  }

  const first = await drawNextPoll(db, eventId);
  await openPoll(db, first.id);
  const second = await drawNextPoll(db, eventId);
  await openPoll(db, second.id);

  expect(await countOpenPolls(db, eventId)).toBe(1);
});

test("cannot redraw an open poll", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await addArtist(db, eventId, "A");
  await addArtist(db, eventId, "B");
  await addArtist(db, eventId, "C");
  await addArtist(db, eventId, "D");

  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  await expect(redrawPoll(db, poll.id)).rejects.toBeInstanceOf(PollRuleError);
});

test("refuses to draw a poll with fewer than two artists", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await addArtist(db, eventId, "A");
  await expect(drawNextPoll(db, eventId)).rejects.toThrow();
});

test("removes an artist from a draft poll instead of crashing", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  for (const name of ["A", "B", "C", "D"]) {
    await addArtist(db, eventId, name);
  }
  await drawNextPoll(db, eventId);
  const roster = await listArtists(db, eventId);
  await removeArtist(db, roster[0].id);
  const remaining = await listArtists(db, eventId);
  expect(remaining.map((artist) => artist.id)).not.toContain(roster[0].id);
});

test("cannot remove an artist from an open poll", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  for (const name of ["A", "B", "C", "D"]) {
    await addArtist(db, eventId, name);
  }
  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  const options = await listPollOptions(db, poll.id);
  await expect(removeArtist(db, options[0].artistId)).rejects.toBeInstanceOf(
    PollRuleError,
  );
});

async function seedRoster(
  db: Awaited<ReturnType<typeof createMemoryDb>>["db"],
  eventId: string,
) {
  for (const name of ["A", "B", "C", "D"]) {
    await addArtist(db, eventId, name);
  }
}

test("openPoll records openedAt", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await seedRoster(db, eventId);
  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  const [row] = await db.select().from(polls).where(eq(polls.id, poll.id));
  expect(row.openedAt).toEqual(expect.any(Number));
});

test("closes an expired open poll on read", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await seedRoster(db, eventId);
  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  await db
    .update(polls)
    .set({ openedAt: Date.now() - POLL_DURATION_MS - 1 })
    .where(eq(polls.id, poll.id));
  expect(await getOpenPoll(db, eventId)).toBeNull();
  const [row] = await db.select().from(polls).where(eq(polls.id, poll.id));
  expect(row.status).toBe("closed");
});

test("rejects votes after the deadline", async () => {
  const { db } = await createMemoryDb();
  const eventId = await createEvent(db);
  await seedRoster(db, eventId);
  const poll = await drawNextPoll(db, eventId);
  await openPoll(db, poll.id);
  const options = await listPollOptions(db, poll.id);
  await db
    .update(polls)
    .set({ openedAt: Date.now() - POLL_DURATION_MS - 1 })
    .where(eq(polls.id, poll.id));
  await expect(
    submitVote(db, {
      pollId: poll.id,
      optionId: options[0].id,
      voterId: createId(),
    }),
  ).rejects.toBeInstanceOf(PollRuleError);
});
