const WINDOW_MS = 10_000;
const MAX_HITS = 8;

const hits = new Map<string, number[]>();

export function allowVoteAttempt(voterId: string, now = Date.now()) {
  const recent = (hits.get(voterId) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );
  if (recent.length >= MAX_HITS) {
    return false;
  }
  recent.push(now);
  hits.set(voterId, recent);
  return true;
}

export function resetRateLimit() {
  hits.clear();
}
