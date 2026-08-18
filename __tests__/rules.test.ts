import { expect, test } from "vitest";
import {
  assertCanClose,
  assertCanDeleteArtist,
  assertCanOpen,
  assertCanRedraw,
  assertCanVote,
  PollRuleError,
} from "@/lib/poll/rules";

test("rejects a second vote", () => {
  expect(() =>
    assertCanVote({
      pollStatus: "open",
      optionPollId: "poll-1",
      pollId: "poll-1",
      alreadyVoted: true,
    }),
  ).toThrow(PollRuleError);
});

test("rejects votes on a closed poll", () => {
  expect(() =>
    assertCanVote({
      pollStatus: "closed",
      optionPollId: "poll-1",
      pollId: "poll-1",
      alreadyVoted: false,
    }),
  ).toThrow(PollRuleError);
});

test("rejects an option from another poll", () => {
  expect(() =>
    assertCanVote({
      pollStatus: "open",
      optionPollId: "poll-2",
      pollId: "poll-1",
      alreadyVoted: false,
    }),
  ).toThrow(PollRuleError);
});

test("only draft polls can be redrawn or opened", () => {
  expect(() => assertCanRedraw("open")).toThrow(PollRuleError);
  expect(() => assertCanOpen("closed")).toThrow(PollRuleError);
  expect(() => assertCanClose("draft")).toThrow(PollRuleError);
});

test("blocks deleting an artist on the open poll", () => {
  expect(() =>
    assertCanDeleteArtist({
      artistId: "a1",
      openPollArtistIds: ["a1", "a2"],
    }),
  ).toThrow(PollRuleError);
});
