import type { PollStatus } from "@/lib/db/schema";

export class PollRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PollRuleError";
  }
}

export function assertCanVote(input: {
  pollStatus: PollStatus;
  optionPollId: string;
  pollId: string;
  alreadyVoted: boolean;
}) {
  if (input.pollStatus !== "open") {
    throw new PollRuleError("This poll is not open for voting.");
  }
  if (input.optionPollId !== input.pollId) {
    throw new PollRuleError("That artist is not part of this poll.");
  }
  if (input.alreadyVoted) {
    throw new PollRuleError("You already voted in this poll.");
  }
}

export function assertCanRedraw(status: PollStatus) {
  if (status !== "draft") {
    throw new PollRuleError("Only a draft poll can be redrawn.");
  }
}

export function assertCanOpen(status: PollStatus) {
  if (status !== "draft") {
    throw new PollRuleError("Only a draft poll can be opened.");
  }
}

export function assertCanClose(status: PollStatus) {
  if (status !== "open") {
    throw new PollRuleError("Only an open poll can be closed.");
  }
}

export function assertCanDeleteArtist(input: {
  artistId: string;
  lockedPollArtistIds: string[];
}) {
  if (input.lockedPollArtistIds.includes(input.artistId)) {
    throw new PollRuleError(
      "Cannot remove an artist who is on an open or closed poll.",
    );
  }
}
