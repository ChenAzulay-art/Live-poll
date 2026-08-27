"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

let pendingMutations = 0;

export function usePauseLiveRefresh(paused: boolean) {
  useEffect(() => {
    if (!paused) {
      return;
    }
    pendingMutations += 1;
    return () => {
      pendingMutations = Math.max(0, pendingMutations - 1);
    };
  }, [paused]);
}

export function LiveRefresh({ intervalMs = 1500 }: { intervalMs?: number }) {
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
