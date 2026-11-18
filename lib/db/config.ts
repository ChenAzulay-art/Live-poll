export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

export function isRemoteDatabaseUrl(url: string) {
  return /^(libsql|https|http|wss|ws):/i.test(url);
}

export function resolveDatabaseUrl() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (url) {
    return url;
  }
  if (process.env.VERCEL) {
    throw new DatabaseConfigError(
      "This hosted site needs a Turso database. In Vercel, add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, then redeploy.",
    );
  }
  return `file:${process.cwd()}/local.db`;
}
