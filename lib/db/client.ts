import { createClient, type Client } from "@libsql/client";
import { createClient as createWebClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";
import { applySchema, SCHEMA_VERSION } from "@/lib/db/migrate";
import { seedIfEmpty } from "@/lib/db/seed";
import { isRemoteDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/config";

export type AppDb = ReturnType<typeof createDatabase>;

export function createDatabase(url = resolveDatabaseUrl()) {
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = isRemoteDatabaseUrl(url)
    ? createWebClient({ url, authToken })
    : createClient({ url, authToken });
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
  livePollSchemaVersion?: number;
};

export async function getDb() {
  if (!globalForDb.livePollDb) {
    globalForDb.livePollDb = prepareDatabase(createDatabase())
      .then((app) => {
        globalForDb.livePollSchemaVersion = SCHEMA_VERSION;
        return app;
      })
      .catch((error: unknown) => {
        globalForDb.livePollDb = undefined;
        throw error;
      });
  }
  const app = await globalForDb.livePollDb;
  if (globalForDb.livePollSchemaVersion !== SCHEMA_VERSION) {
    await applySchema(app.client);
    globalForDb.livePollSchemaVersion = SCHEMA_VERSION;
  }
  return app;
}

export async function createMemoryDb() {
  const app = createDatabase(":memory:");
  await prepareDatabase(app, { seed: false });
  return app;
}

export type { Client };
