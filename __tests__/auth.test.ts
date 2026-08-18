import { expect, test } from "vitest";
import {
  createDjSessionToken,
  pinMatches,
  verifyDjSessionToken,
} from "@/lib/auth/session";

test("accepts the configured DJ PIN", () => {
  const previous = process.env.DJ_PIN;
  process.env.DJ_PIN = "9876";
  expect(pinMatches("9876")).toBe(true);
  expect(pinMatches("1234")).toBe(false);
  process.env.DJ_PIN = previous;
});

test("creates a verifiable DJ session token", () => {
  const now = 1_700_000_000_000;
  const token = createDjSessionToken(now);
  expect(verifyDjSessionToken(token, now + 1000)).toBe(true);
  expect(verifyDjSessionToken(token, now + 1000 * 60 * 60 * 13)).toBe(false);
  expect(verifyDjSessionToken("nope", now)).toBe(false);
});
