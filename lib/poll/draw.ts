export type DrawArtist = {
  id: string;
  name: string;
};

export class DrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DrawError";
  }
}

function clampDrawSize(drawSize: number, rosterLength: number) {
  return Math.min(Math.max(drawSize, 2), rosterLength);
}

function sampleWithoutReplacement<T>(
  items: T[],
  count: number,
  random: () => number,
): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function drawArtists(input: {
  roster: DrawArtist[];
  usedArtistIds: string[];
  drawSize: number;
  random?: () => number;
}): DrawArtist[] {
  const { roster, usedArtistIds, drawSize, random = Math.random } = input;

  if (roster.length < 2) {
    throw new DrawError("Add at least 2 artists before drawing a poll.");
  }

  const size = clampDrawSize(drawSize, roster.length);
  const used = new Set(usedArtistIds);
  const unused = roster.filter((artist) => !used.has(artist.id));
  const pool = unused.length >= size ? unused : roster;
  const drawn = sampleWithoutReplacement(pool, size, random);
  const uniqueIds = new Set(drawn.map((artist) => artist.id));

  if (uniqueIds.size !== drawn.length) {
    throw new DrawError("Draw produced duplicate artists.");
  }

  return drawn;
}

export function clampPollDrawSize(drawSize: number, rosterLength: number) {
  if (rosterLength < 2) {
    throw new DrawError("Add at least 2 artists before drawing a poll.");
  }
  return clampDrawSize(drawSize, rosterLength);
}
