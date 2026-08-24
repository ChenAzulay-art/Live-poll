export const POLL_DURATION_MS = 90_000;
export const URGENT_WINDOW_MS = 10_000;

export function closesAt(openedAt: number | null | undefined) {
  if (openedAt == null) {
    return null;
  }
  return openedAt + POLL_DURATION_MS;
}

export function isExpired(
  openedAt: number | null | undefined,
  now = Date.now(),
) {
  const deadline = closesAt(openedAt);
  return deadline != null && now >= deadline;
}

export function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function remainingMs(deadline: number, now = Date.now()) {
  return Math.max(0, deadline - now);
}

export function isUrgent(remaining: number) {
  return remaining > 0 && remaining <= URGENT_WINDOW_MS;
}

export function winningOptions<T extends { votes: number }>(
  options: T[],
  total: number,
): T[] {
  if (total === 0 || options.length === 0) {
    return [];
  }
  const max = Math.max(...options.map((option) => option.votes));
  return options.filter((option) => option.votes === max);
}
