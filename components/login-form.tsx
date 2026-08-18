"use client";

import { useActionState } from "react";
import { loginDj } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginDj, null);

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <label className="text-sm font-medium text-zinc-400" htmlFor="pin">
        DJ PIN
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        required
        className="h-12 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-lg text-zinc-50 outline-none focus:border-amber-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-amber-400 font-semibold text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter booth"}
      </button>
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}
    </form>
  );
}
