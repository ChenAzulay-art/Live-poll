import { ArtistList } from "@/components/artist-list";
import { getDb } from "@/lib/db/client";
import { getDefaultEvent, listArtists } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const { db } = await getDb();
  const event = await getDefaultEvent(db);
  const artists = event ? await listArtists(db, event.id) : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Artist list</h1>
        <p className="text-zinc-400">
          Add names before the night starts. Polls will draw from this list.
        </p>
      </div>
      <ArtistList artists={artists} />
    </main>
  );
}
