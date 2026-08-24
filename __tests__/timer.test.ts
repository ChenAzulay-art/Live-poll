import { expect, test } from "vitest";
import {
  formatCountdown,
  isExpired,
  isUrgent,
  winningOptions,
  POLL_DURATION_MS,
  URGENT_WINDOW_MS,
} from "@/lib/poll/timer";

test("picks a single winner", () => {
  const winners = winningOptions(
    [
      { id: "a", label: "Bicep", votes: 3 },
      { id: "b", label: "Overmono", votes: 1 },
    ],
    4,
  );
  expect(winners.map((option) => option.label)).toEqual(["Bicep"]);
});

test("returns every tied winner", () => {
  const winners = winningOptions(
    [
      { id: "a", label: "Bicep", votes: 2 },
      { id: "b", label: "Overmono", votes: 2 },
    ],
    4,
  );
  expect(winners.map((option) => option.label)).toEqual(["Bicep", "Overmono"]);
});

test("returns no winner when nobody voted", () => {
  expect(
    winningOptions(
      [
        { id: "a", label: "Bicep", votes: 0 },
        { id: "b", label: "Overmono", votes: 0 },
      ],
      0,
    ),
  ).toEqual([]);
});

test("treats a poll as expired after 90 seconds", () => {
  const openedAt = 1_000;
  expect(isExpired(openedAt, openedAt + POLL_DURATION_MS - 1)).toBe(false);
  expect(isExpired(openedAt, openedAt + POLL_DURATION_MS)).toBe(true);
  expect(isExpired(null, Date.now())).toBe(false);
});

test("formats countdown as m:ss", () => {
  expect(formatCountdown(90_000)).toBe("1:30");
  expect(formatCountdown(5_000)).toBe("0:05");
  expect(formatCountdown(0)).toBe("0:00");
});

test("marks the last ten seconds as urgent", () => {
  expect(isUrgent(URGENT_WINDOW_MS)).toBe(true);
  expect(isUrgent(URGENT_WINDOW_MS + 1)).toBe(false);
  expect(isUrgent(0)).toBe(false);
});
