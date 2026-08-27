import { expect, test } from "vitest";
import { boothStage } from "@/lib/poll/booth";

test("shows a new draft instead of the previous winner", () => {
  expect(
    boothStage({
      hasOpenPoll: false,
      hasDraftPoll: true,
      hasClosedPoll: true,
    }),
  ).toBe("draft");
});

test("keeps the winner up after a round until the DJ draws again", () => {
  expect(
    boothStage({
      hasOpenPoll: false,
      hasDraftPoll: false,
      hasClosedPoll: true,
    }),
  ).toBe("winner");
});
