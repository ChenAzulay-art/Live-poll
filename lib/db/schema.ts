import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const pollStatuses = ["draft", "open", "closed"] as const;
export type PollStatus = (typeof pollStatuses)[number];

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  drawSize: integer("draw_size").notNull().default(4),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const artists = sqliteTable(
  "artists",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("artists_event_name").on(table.eventId, table.name)],
);

export const polls = sqliteTable("polls", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  status: text("status").$type<PollStatus>().notNull(),
  position: integer("position").notNull(),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
  openedAt: integer("opened_at", { mode: "number" }),
});

export const pollOptions = sqliteTable("poll_options", {
  id: text("id").primaryKey(),
  pollId: text("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  artistId: text("artist_id")
    .notNull()
    .references(() => artists.id),
  label: text("label").notNull(),
  position: integer("position").notNull(),
});

export const votes = sqliteTable(
  "votes",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => pollOptions.id),
    voterId: text("voter_id").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("votes_poll_voter").on(table.pollId, table.voterId)],
);
