"use client";

import { useActionState } from "react";
import { joinEvent } from "@/app/actions";

export function JoinForm() {
  const [state, action, pending] = useActionState(joinEvent, null);

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <label
        className="text-xs font-medium uppercase tracking-[0.2em] text-mute"
        htmlFor="code"
      >
        Night code
      </label>
      <input
        id="code"
        name="code"
        required
        autoCapitalize="characters"
        placeholder="NIGHT"
        className="h-14 rounded-full border border-paper/15 bg-night px-5 text-lg tracking-[0.28em] text-paper uppercase outline-none placeholder:text-mute focus:border-acid"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-14 rounded-full bg-acid px-5 font-semibold text-night disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join the vote →"}
      </button>
      {state?.error ? <p className="text-sm text-acid">{state.error}</p> : null}
    </form>
  );
}
