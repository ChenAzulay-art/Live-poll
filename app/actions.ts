"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import {
  addArtist,
  closePoll,
  drawNextPoll,
  getDefaultEvent,
  getEventByCode,
  moveArtist,
  openPoll,
  redrawPoll,
  removeArtist,
  renameArtist,
  submitVote,
} from "@/lib/db/queries";
import {
  clearDjSessionCookie,
  getOrCreateVoterId,
  requireDjSession,
  setDjSessionCookie,
} from "@/lib/auth/cookies";
import { pinMatches } from "@/lib/auth/session";
import { allowVoteAttempt } from "@/lib/auth/rate-limit";
import { PollRuleError } from "@/lib/poll/rules";
import { DrawError } from "@/lib/poll/draw";

type ActionState = { error?: string } | null;

function errorMessage(error: unknown) {
  if (error instanceof PollRuleError || error instanceof DrawError) {
    return error.message;
  }
  const message = error instanceof Error ? error.message : "";
  if (message.toLowerCase().includes("unique")) {
    return "That name is already on the list.";
  }
  return "Something went wrong. Try again.";
}

export async function loginDj(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pin = String(formData.get("pin") ?? "");
  if (!pinMatches(pin)) {
    return { error: "Wrong PIN." };
  }
  await setDjSessionCookie();
  redirect("/dj");
}

export async function logoutDj() {
  await clearDjSessionCookie();
  redirect("/dj/login");
}

export async function joinEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  if (!code) {
    return { error: "Enter tonight's code." };
  }
  const { db } = await getDb();
  const event = await getEventByCode(db, code);
  if (!event) {
    return { error: "No night found for that code." };
  }
  redirect(`/vote/${event.code}`);
}

async function requireEvent() {
  await requireDjSession();
  const { db } = await getDb();
  const event = await getDefaultEvent(db);
  if (!event) {
    throw new PollRuleError("No event is set up yet.");
  }
  return { db, event };
}

export async function addArtistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { db, event } = await requireEvent();
    await addArtist(db, event.id, String(formData.get("name") ?? ""));
    revalidatePath("/dj/artists");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function renameArtistAction(formData: FormData) {
  await requireDjSession();
  const { db } = await getDb();
  await renameArtist(
    db,
    String(formData.get("artistId") ?? ""),
    String(formData.get("name") ?? ""),
  );
  revalidatePath("/dj/artists");
}

export async function removeArtistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireDjSession();
    const { db } = await getDb();
    await removeArtist(db, String(formData.get("artistId") ?? ""));
    revalidatePath("/dj/artists");
    revalidatePath("/dj");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function moveArtistAction(formData: FormData) {
  await requireDjSession();
  const { db } = await getDb();
  const direction = String(formData.get("direction") ?? "");
  if (direction !== "up" && direction !== "down") {
    return;
  }
  await moveArtist(db, String(formData.get("artistId") ?? ""), direction);
  revalidatePath("/dj/artists");
}

export async function drawPollAction(): Promise<ActionState> {
  try {
    const { db, event } = await requireEvent();
    await drawNextPoll(db, event.id);
    revalidatePath("/dj");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function redrawPollAction(pollId: string): Promise<ActionState> {
  try {
    await requireDjSession();
    const { db } = await getDb();
    await redrawPoll(db, pollId);
    revalidatePath("/dj");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function openPollAction(pollId: string): Promise<ActionState> {
  try {
    await requireDjSession();
    const { db } = await getDb();
    await openPoll(db, pollId);
    revalidatePath("/dj");
    revalidatePath("/vote/[code]", "page");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function closePollAction(pollId: string): Promise<ActionState> {
  try {
    await requireDjSession();
    const { db } = await getDb();
    await closePoll(db, pollId);
    revalidatePath("/dj");
    revalidatePath("/vote/[code]", "page");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function submitVoteAction(
  pollId: string,
  optionId: string,
): Promise<ActionState> {
  try {
    const voterId = await getOrCreateVoterId();
    if (!allowVoteAttempt(voterId)) {
      return { error: "Too many votes too fast. Wait a moment." };
    }
    const { db } = await getDb();
    await submitVote(db, { pollId, optionId, voterId });
    revalidatePath("/vote/[code]", "page");
    revalidatePath("/dj");
    return null;
  } catch (error) {
    return { error: errorMessage(error) };
  }
}
