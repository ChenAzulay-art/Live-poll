export type BoothStage = "live" | "draft" | "winner" | "waiting";

export function boothStage(input: {
  hasOpenPoll: boolean;
  hasDraftPoll: boolean;
  hasClosedPoll: boolean;
}): BoothStage {
  if (input.hasOpenPoll) {
    return "live";
  }
  if (input.hasDraftPoll) {
    return "draft";
  }
  if (input.hasClosedPoll) {
    return "winner";
  }
  return "waiting";
}
