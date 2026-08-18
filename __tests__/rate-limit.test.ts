import { expect, test } from "vitest";
import { allowVoteAttempt, resetRateLimit } from "@/lib/auth/rate-limit";

test("rate-limits burst vote attempts from the same voter", () => {
  resetRateLimit();
  const now = 1_000;
  for (let i = 0; i < 8; i += 1) {
    expect(allowVoteAttempt("voter-1", now + i)).toBe(true);
  }
  expect(allowVoteAttempt("voter-1", now + 9)).toBe(false);
  expect(allowVoteAttempt("voter-1", now + 11_000)).toBe(true);
});
