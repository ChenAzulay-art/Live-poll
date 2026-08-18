"use client";

import { useActionState } from "react";
import {
  addArtistAction,
  moveArtistAction,
  removeArtistAction,
  renameArtistAction,
} from "@/app/actions";

type Artist = {
  id: string;
  name: string;
};

export function ArtistList({ artists }: { artists: Artist[] }) {
  const [state, action, pending] = useActionState(addArtistAction, null);

  return (
    <div className="flex flex-col gap-8">
      <form action={action} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          required
          placeholder="Add an artist"
          className="h-12 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-50 outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-xl bg-amber-400 px-5 font-semibold text-zinc-950 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
      {state?.error ? (
        <p className="text-sm text-rose-300">{state.error}</p>
      ) : null}

      {artists.length === 0 ? (
        <p className="text-zinc-400">Add artists before the night starts.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {artists.map((artist) => (
            <li
              key={artist.id}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:flex-row sm:items-center"
            >
              <form action={renameArtistAction} className="flex flex-1 gap-2">
                <input type="hidden" name="artistId" value={artist.id} />
                <input
                  name="name"
                  defaultValue={artist.name}
                  className="h-11 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-zinc-50 outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="h-11 rounded-xl border border-zinc-600 px-3 text-sm text-zinc-200"
                >
                  Save
                </button>
              </form>
              <form action={moveArtistAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="h-11 rounded-xl px-3 text-sm text-zinc-300"
                >
                  Up
                </button>
              </form>
              <form action={moveArtistAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="h-11 rounded-xl px-3 text-sm text-zinc-300"
                >
                  Down
                </button>
              </form>
              <form action={removeArtistAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <button
                  type="submit"
                  className="h-11 rounded-xl px-3 text-sm text-rose-300"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {artists.length > 0 && artists.length < 2 ? (
        <p className="text-sm text-amber-300">
          Add at least 2 artists before you can draw a poll.
        </p>
      ) : null}
    </div>
  );
}
