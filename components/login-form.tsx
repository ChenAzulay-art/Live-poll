"use client";

import { useActionState } from "react";
import { loginDj } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginDj, null);

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <label
        className="text-xs font-medium uppercase tracking-[0.2em] text-mute"
        htmlFor="pin"
      >
        DJ PIN
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        required
        className="h-14 rounded-full border border-paper/15 bg-night px-5 text-lg text-paper outline-none focus:border-acid"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-14 rounded-full bg-acid px-5 font-semibold text-night disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter booth →"}
      </button>
      {state?.error ? <p className="text-sm text-acid">{state.error}</p> : null}
    </form>
  );
}
