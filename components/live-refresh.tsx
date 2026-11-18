"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

let pendingMutations = 0;
const PAUSE_MS = 4_000;

export function usePauseLiveRefresh(paused: boolean) {
  useEffect(() => {
    if (!paused) {
      return;
    }
    pendingMutations += 1;
    let released = false;
    const release = () => {
      if (released) {
        return;
      }
      released = true;
      pendingMutations = Math.max(0, pendingMutations - 1);
    };
    const timeout = window.setTimeout(release, PAUSE_MS);
    return () => {
      window.clearTimeout(timeout);
      release();
    };
  }, [paused]);
}

export function LiveRefresh({ intervalMs = 2000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (pendingMutations > 0) {
        return;
      }
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, router]);

  return null;
}
