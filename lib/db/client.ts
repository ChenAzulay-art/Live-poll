import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";
import { applySchema } from "@/lib/db/migrate";
import { seedIfEmpty } from "@/lib/db/seed";

export type AppDb = ReturnType<typeof createDatabase>;

function databaseUrl() {
  return process.env.DATABASE_URL ?? `file:${process.cwd()}/local.db`;
}

export function createDatabase(url = databaseUrl()) {
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });
  return { client, db };
}

export async function prepareDatabase(
  app: AppDb,
  options?: { seed?: boolean },
) {
  await applySchema(app.client);
  if (options?.seed !== false) {
    await seedIfEmpty(app.db);
  }
  return app;
}

const globalForDb = globalThis as unknown as {
  livePollDb?: Promise<AppDb>;
};

export async function getDb() {
  if (!globalForDb.livePollDb) {
    globalForDb.livePollDb = prepareDatabase(createDatabase()).catch(
      (error: unknown) => {
        globalForDb.livePollDb = undefined;
        throw error;
      },
    );
  }
  const app = await globalForDb.livePollDb;
  // Re-run after HMR so existing connections pick up new columns.
  await applySchema(app.client);
  return app;
}

export async function createMemoryDb() {
  const app = createDatabase(":memory:");
  await prepareDatabase(app, { seed: false });
  return app;
}

export type { Client };
