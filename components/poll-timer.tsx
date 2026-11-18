"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatCountdown, isUrgent, remainingMs } from "@/lib/poll/timer";

const URGENT_TICK_MS = 11_000;

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
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      const left = remainingMs(closesAt, current);
      timeoutId = setTimeout(tick, left <= URGENT_TICK_MS ? 100 : 250);
    };
    tick();
    return () => clearTimeout(timeoutId);
  }, [closesAt]);

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
      suppressHydrationWarning
      className={`font-display tabular-nums tracking-tight text-acid ${
        urgent ? "animate-pulse text-7xl" : compact ? "text-3xl" : "text-5xl"
      }`}
    >
      {formatCountdown(remaining)}
    </p>
  );
}
