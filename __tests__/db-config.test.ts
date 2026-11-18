import { expect, test } from "vitest";
import {
  DatabaseConfigError,
  isRemoteDatabaseUrl,
  resolveDatabaseUrl,
} from "@/lib/db/config";

test("treats Turso URLs as remote", () => {
  expect(isRemoteDatabaseUrl("libsql://demo-user.turso.io")).toBe(true);
  expect(isRemoteDatabaseUrl("https://demo-user.turso.io")).toBe(true);
  expect(isRemoteDatabaseUrl("file:local.db")).toBe(false);
  expect(isRemoteDatabaseUrl(":memory:")).toBe(false);
});

test("requires a remote database on Vercel", () => {
  const previous = {
    VERCEL: process.env.VERCEL,
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  };
  process.env.VERCEL = "1";
  delete process.env.DATABASE_URL;
  delete process.env.TURSO_DATABASE_URL;

  expect(() => resolveDatabaseUrl()).toThrow(DatabaseConfigError);

  restoreEnv("VERCEL", previous.VERCEL);
  restoreEnv("DATABASE_URL", previous.DATABASE_URL);
  restoreEnv("TURSO_DATABASE_URL", previous.TURSO_DATABASE_URL);
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
