---
name: safe-related-deletes
description: >-
  Prevent SQLite/Drizzle foreign-key delete crashes and raw Next.js runtime
  overlays. Use when removing artists, deleting rows referenced by polls or
  other tables, writing remove/delete Server Actions, or seeing Failed query
  delete / FOREIGN KEY constraint failed.
---

# Safe related deletes

Never `DELETE` a row that other tables still reference. Catch expected failures in Server Actions and return `{ error }` — do not throw to the Next.js overlay.

## Before deleting

1. Query incoming references (joins), not only the “open” case.
2. Decide per parent status:
   - **Open or closed poll:** refuse with `PollRuleError` and a human message.
   - **Draft poll:** detach first (`DELETE` child rows / drop the draft if it would have fewer than 2 options), then delete the parent.
   - **Unreferenced:** delete the parent.
3. Add a test for both the refuse path and the draft-detach path.

In this app, `poll_options.artist_id` → `artists.id` with no `ON DELETE CASCADE`. An artist on any poll (including a **draft** after “Draw next poll”) will fail:

```sql
delete from "artists" where "artists"."id" = ?
```

## Server Actions

Form `action={removeX}` that **throws** becomes a Runtime Error overlay.

```ts
// BAD
export async function removeArtistAction(formData: FormData) {
  await removeArtist(db, id); // throws Failed query
}

// GOOD
export async function removeArtistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await removeArtist(db, id);
    revalidatePath("/dj/artists");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
```

Wire it with `useActionState` and render `state?.error` on the page.

`errorMessage` must map `PollRuleError` (and unique-constraint text) to copy. Do not show raw SQL.

## Checklist

- [ ] Reference check covers **draft, open, and closed**
- [ ] Draft children are removed before the parent
- [ ] Locked rows return a sentence the DJ can act on (close/redraw first)
- [ ] Delete action returns `ActionState`, does not throw
- [ ] Tests: draft remove succeeds; open-poll remove throws `PollRuleError`
