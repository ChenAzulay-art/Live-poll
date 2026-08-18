import { count } from "drizzle-orm";
import { artists, events } from "@/lib/db/schema";
import { createEventCode, createId } from "@/lib/ids";
import type { Db } from "@/lib/db/queries";

export const DEMO_EVENT_CODE = "NIGHT";

const DEMO_ARTISTS = [
  "Daft Punk",
  "Fred again..",
  "Peggy Gou",
  "Four Tet",
  "Overmono",
  "Bicep",
  "HAAi",
  "Interplanetary Criminal",
  "Salute",
  "Barry Can't Swim",
];

export async function seedIfEmpty(db: Db) {
  const [row] = await db.select({ value: count(events.id) }).from(events);
  if ((row?.value ?? 0) > 0) {
    return;
  }

  const eventId = createId();
  const now = Date.now();

  await db.insert(events).values({
    id: eventId,
    name: "Tonight",
    code: DEMO_EVENT_CODE,
    drawSize: 4,
    createdAt: now,
  });

  await db.insert(artists).values(
    DEMO_ARTISTS.map((name, position) => ({
      id: createId(),
      eventId,
      name,
      position,
      createdAt: now,
    })),
  );
}

export { createEventCode };
