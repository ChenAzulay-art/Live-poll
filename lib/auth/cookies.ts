import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createId } from "@/lib/ids";
import {
  createDjSessionToken,
  djSessionCookie,
  verifyDjSessionToken,
  voterCookie,
} from "@/lib/auth/session";

export async function requireDjSession() {
  const store = await cookies();
  if (!verifyDjSessionToken(store.get(djSessionCookie.name)?.value)) {
    redirect("/dj/login");
  }
}

export async function getVoterId() {
  const store = await cookies();
  return store.get(voterCookie.name)?.value ?? null;
}

export async function getOrCreateVoterId() {
  const store = await cookies();
  const existing = store.get(voterCookie.name)?.value;
  if (existing) {
    return existing;
  }
  const voterId = createId();
  store.set(voterCookie.name, voterId, voterCookie.options);
  return voterId;
}

export async function setDjSessionCookie() {
  const store = await cookies();
  store.set(
    djSessionCookie.name,
    createDjSessionToken(),
    djSessionCookie.options,
  );
}

export async function clearDjSessionCookie() {
  const store = await cookies();
  store.delete(djSessionCookie.name);
}
