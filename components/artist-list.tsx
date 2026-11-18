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
  const [addState, addAction, addPending] = useActionState(
    addArtistAction,
    null,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeArtistAction,
    null,
  );

  return (
    <div className="flex flex-col gap-8">
      <form action={addAction} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          required
          placeholder="Add an artist"
          className="h-14 flex-1 rounded-full border border-paper/15 bg-night px-5 text-paper outline-none placeholder:text-mute focus:border-acid"
        />
        <button
          type="submit"
          disabled={addPending}
          className="h-14 rounded-full bg-acid px-6 font-semibold text-night disabled:opacity-60"
        >
          {addPending ? "Adding…" : "Add →"}
        </button>
      </form>
      {addState?.error ? (
        <p className="text-sm text-acid">{addState.error}</p>
      ) : null}
      {removeState?.error ? (
        <p className="text-sm text-acid">{removeState.error}</p>
      ) : null}

      {artists.length === 0 ? (
        <p className="text-mute">Add artists before the night starts.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {artists.map((artist) => (
            <li
              key={artist.id}
              className="flex flex-col gap-2 bg-paper/5 p-3 sm:flex-row sm:items-center"
            >
              <form action={renameArtistAction} className="flex flex-1 gap-2">
                <input type="hidden" name="artistId" value={artist.id} />
                <input
                  name="name"
                  defaultValue={artist.name}
                  className="h-11 flex-1 rounded-full border border-paper/10 bg-night px-4 text-paper outline-none focus:border-acid"
                />
                <button
                  type="submit"
                  className="h-11 rounded-full border border-paper/20 px-4 text-sm text-paper"
                >
                  Save
                </button>
              </form>
              <form action={moveArtistAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <input type="hidden" name="direction" value="up" />
                <button
                  type="submit"
                  className="h-11 rounded-full px-3 text-sm text-mute hover:text-paper"
                >
                  Up
                </button>
              </form>
              <form action={moveArtistAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <input type="hidden" name="direction" value="down" />
                <button
                  type="submit"
                  className="h-11 rounded-full px-3 text-sm text-mute hover:text-paper"
                >
                  Down
                </button>
              </form>
              <form action={removeAction}>
                <input type="hidden" name="artistId" value={artist.id} />
                <button
                  type="submit"
                  disabled={removePending}
                  className="h-11 rounded-full px-3 text-sm text-mute hover:text-acid disabled:opacity-60"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {artists.length > 0 && artists.length < 2 ? (
        <p className="text-sm text-acid">
          Add at least 2 artists before you can draw a poll.
        </p>
      ) : null}
    </div>
  );
}
