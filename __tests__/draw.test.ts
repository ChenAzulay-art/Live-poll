import { expect, test } from "vitest";
import { DrawError, clampPollDrawSize, drawArtists } from "@/lib/poll/draw";

const roster = [
  { id: "1", name: "A" },
  { id: "2", name: "B" },
  { id: "3", name: "C" },
  { id: "4", name: "D" },
  { id: "5", name: "E" },
];

test("draws only from the event roster without duplicates", () => {
  const drawn = drawArtists({
    roster,
    usedArtistIds: [],
    drawSize: 4,
    random: () => 0,
  });

  expect(drawn).toHaveLength(4);
  expect(new Set(drawn.map((artist) => artist.id)).size).toBe(4);
  for (const artist of drawn) {
    expect(roster.some((item) => item.id === artist.id)).toBe(true);
  }
});

test("prefers artists that have not been used yet", () => {
  const drawn = drawArtists({
    roster,
    usedArtistIds: ["1", "2", "3"],
    drawSize: 2,
    random: () => 0,
  });

  expect(drawn.map((artist) => artist.id).sort()).toEqual(["4", "5"]);
});

test("reshuffles the full roster when unused artists run out", () => {
  const drawn = drawArtists({
    roster,
    usedArtistIds: ["1", "2", "3", "4"],
    drawSize: 4,
    random: () => 0,
  });

  expect(drawn).toHaveLength(4);
  expect(new Set(drawn.map((artist) => artist.id)).size).toBe(4);
});

test("refuses to draw with fewer than two artists", () => {
  expect(() =>
    drawArtists({
      roster: [{ id: "1", name: "A" }],
      usedArtistIds: [],
      drawSize: 4,
    }),
  ).toThrow(DrawError);
});

test("clamps draw size to the roster length", () => {
  expect(clampPollDrawSize(8, 3)).toBe(3);
  expect(clampPollDrawSize(1, 5)).toBe(2);
});
