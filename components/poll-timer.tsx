"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatCountdown, isUrgent, remainingMs } from "@/lib/poll/timer";

export function PollTimer({
  closesAt,
  compact = false,
}: {
  closesAt: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const refreshed = useRef(false);
  const remaining = remainingMs(closesAt, now);
  const urgent = isUrgent(remaining);

  useEffect(() => {
    const intervalMs = remaining <= URGENT_TICK_MS ? 100 : 250;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    if (remaining <= 0 && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [remaining, router]);

  return (
    <p
      role="timer"
      aria-live="polite"
      className={`font-semibold tabular-nums tracking-tight ${
        urgent
          ? "animate-pulse text-7xl text-rose-400"
          : compact
            ? "text-3xl text-purple-400"
            : "text-5xl text-purple-400"
      }`}
    >
      {formatCountdown(remaining)}
    </p>
  );
}

const URGENT_TICK_MS = 11_000;
