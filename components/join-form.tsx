"use client";

import { useActionState } from "react";
import { joinEvent } from "@/app/actions";

export function JoinForm() {
  const [state, action, pending] = useActionState(joinEvent, null);

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <label className="text-sm font-medium text-zinc-400" htmlFor="code">
        Night code
      </label>
      <input
        id="code"
        name="code"
        required
        autoCapitalize="characters"
        placeholder="NIGHT"
        className="h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-lg tracking-[0.2em] text-zinc-50 uppercase outline-none focus:border-amber-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-amber-400 font-semibold text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join the vote"}
      </button>
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
    </form>
  );
}
